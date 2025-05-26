pipeline {
	agent any

	parameters {
  		choice(name: 'ENV', choices: ['develop', 'master'], description: 'Select deploy environment')
	}

	stages {

		stage('Decide Environment') {
			steps {
				script {
					def branch = env.BRANCH_NAME ? env.BRANCH_NAME : env.GIT_BRANCH
					echo "🚀 Branch: ${branch}"

					def selectedEnv = params.ENV?.trim()?.toLowerCase()

					// null 이거나 공백이거나 잘못된 값일 경우 자동 분기
					if (!selectedEnv || !(selectedEnv in ['develop', 'master'])) {
						selectedEnv = (branch == 'develop') ? 'develop' : 'master'
						echo "🔄 ENV auto-detected as: ${selectedEnv}"
					} else {
						selectedEnv = branch
						echo "✅ ENV manually selected: ${selectedEnv}"
					}

					env.ENV = selectedEnv
				}
			}
		}

		stage('Check ENV Credential Files') {
			steps {
				script {

					def checkCredential = { filePath, name ->
		                if (!fileExists(filePath)) {
		                    error "❌ Credential ${name} is missing."
		                } else {
		                    echo "✅ Credential ${name} is available."
		                }
	            	}

					withCredentials([
						file(credentialsId: 'DB_CRED', variable: 'DB_CRED_FILE')
						]) {
                        checkCredential(DB_CRED_FILE, "DB_CRED")
					}
				}
			}
		}

		stage('Generate .env files') {
		    steps {
		        withCredentials([
		            file(credentialsId: 'DB_CRED', variable: 'DB_FILE')
		        ]) {
		            script {
		                def db = readJSON file: DB_FILE
		                def dbContent = db.collect { k, v -> "${k}=${v}" }.join('\n')
		                writeFile file: '.env', text: dbContent
		            }
		        }
		    }
		}

		stage('Set the .env value per brancah')
		{
			steps {
				script {
					def db = readProperties file: '.env'

					def isDev = (env.ENV == 'develop')

					def mySQLDbName = isDev ? db.MYSQL_DEV_DATABASE : db.MYSQL_DATABASE
					def mongoDbName ='nift_db'

					//덮어쓰기
					db["MYSQL_DATABASE"] = mySQLDbName
					db["MONGO_INITDB_DATABASE"] = mongoDbName

					//Spring datasource URL DB명 치환
					db["SPRING_DATASOURCE_URL"] = db["SPRING_DATASOURCE_URL"]
					.replaceAll(/\/[^\/?]+\?/, "/${mySQLDbName}?")

					// Mongo URI 구성: 아이디, 비번, DB명 모두 치환
					def mongoUser = db["MONGO_INITDB_ROOT_USERNAME"]
					def mongoPass = db["MONGO_INITDB_ROOT_PASSWORD"]
					def mongoHost = "mongo:27017"

					//Spring mongo URI도 치환
					db["SPRING_DATA_MONGODB_URI"] = "mongodb://${mongoUser}:${mongoPass}@${mongoHost}/${mongoDbName}?authSource=admin"

					//바꾼 값들을 반영한 .env 파일 생성
					def dbContent = db.collect { k, v -> "${k}=${v}"}.join('\n')
					writeFile file: '.env', text: dbContent
				}
			}
		}

		stage('Run Docker Compose') {
			steps {
				script {
					try {
						sh 'cp .env ./frontend'
						sh 'cp .env ./admin'
						sh "docker-compose --env-file .env up -d --build"	
						env.IMAGE_BUILD_SUCCESS = "true"
					}
					catch(Exception e) {
						env.IMAGE_BUILD_SUCCESS = "false"
						currentBuild.result = 'FAILURE'
						echo"❌ Docker 이미지 생성 실패"
					}
					
				}
			}
		}


		stage('Flyway Check and Migration') {
		    steps {
		        script {

	            	def props = readProperties file: '.env'
		            def workspace = env.WORKSPACE.replaceFirst("^/var/jenkins_home", "/home/ubuntu/jenkins-data")
		            def migrationPath = (env.ENV == 'develop') ?
		               	"${workspace}/backend/src/main/resources/db/migration" :
		                "${workspace}/backend/src/main/resources/db/migration_master"

  					echo "Migration Path: ${migrationPath}"

					def baseCmd = """
					    docker run --rm \\
					      --network shared_backend \\
					      -v ${migrationPath}:/flyway/sql \\
					      flyway/flyway \\
					      -locations=filesystem:/flyway/sql \\
					      -url='jdbc:mysql://mysql:3306/${props.MYSQL_DATABASE}?allowPublicKeyRetrieval=true&useSSL=false' \\
					      -user=${props.MYSQL_USER} \\
					      -password=${props.MYSQL_PASSWORD}
					""".stripIndent().trim()

					// 초기 info 시도
					def infoOutput = sh(
					    script: "${baseCmd} info -outputType=json 2>&1 || true",
					    returnStdout: true
					).trim()

					def infoJson
					try {
					    infoJson = readJSON text: infoOutput
					} catch (e) {
					    if (infoOutput.contains("Detected failed migration") || infoOutput.contains("Validate failed")) {
					        echo "🛠️ Validate 실패 감지 → repair 시도"
					        sh "${baseCmd} repair"
					        infoOutput = sh(script: "${baseCmd} info -outputType=json", returnStdout: true).trim()
					        infoJson = readJSON text: infoOutput
					    } else {
					        error "❌ Flyway info 실패: repair로도 복구할 수 없는 문제\n${infoOutput}"
					    }
					}

					// 상태 확인
					echo "📦 Flyway info 상태:\n${infoOutput}"

					def needsRepair = infoJson?.migrations?.any {
						it.state.toLowerCase() in ['failed', 'missing_success', 'outdated', 'ignored']
					} ?: false
					
					if (needsRepair) {
					    echo "⚠️ Flyway 상태 이상 감지 → repair + migrate 실행"
					    sh "${baseCmd} repair"
					}

					sh "${baseCmd} migrate"

		        }
		    }
		}

	}

	post {
	    always {
	        script {
	            try {

	            	def sendMessage = {String msg -> 
	            		def payload = groovy.json.JsonOutput.toJson([text: msg])
						writeFile file: 'payload.json', text: payload

						withCredentials([string(credentialsId: 'MATTERMOST_WEBHOOK', variable: 'MATTERMOST_WEBHOOK')]){
							sh(
								script: '''
									curl -X POST -H 'Content-Type: application/json' -d @payload.json \$MATTERMOST_WEBHOOK
								''',
								label: 'Send message'
							)
						}
	            	}
					
	                if (env.IMAGE_BUILD_SUCCESS == "true") {

						def message = """
						*Static Analysis Report*
						- Job: ${env.JOB_NAME}
						- Build: #${env.BUILD_NUMBER}
						- 툴별 결과:
						""".stripIndent()

						sendMessage(message)
	                    
	                } else {
	                    def message = """
	                    ❌ *Docker 이미지 생성 실패*
	                    - Job: ${env.JOB_NAME}
	                    - Build: #${env.BUILD_NUMBER}
	                    - [Jenkins 로그 보기](${env.BUILD_URL})
	                    """.stripIndent()
	                    
	                    sendMessage(message)
	                }
	                
	                 // .env 파일 삭제
                	sh 'find . -name ".env" -delete'
                	//메시지 관련 .json 삭제
                	sh'rm -f payload.json'
                	
	            } catch (e) {
	                echo "recordIssues() 중 오류 발생: ${e}"
	            }
	        }
	    }


		success {
			script {
				if (env.ENV == 'production') {
					echo '✅ Build succeeded, tagging as stable...'
					sh '''
						docker tag backend backend:stable
						docker tag frontend frontend:stable
						docker push backend:stable
						docker push frontend:stable
					'''
				}
			}
		}

		failure {
			script {
				if (env.ENV == 'production') {
					echo '❗ Build failed. Rolling back to stable image...'
					sh '''
						docker stop backend || true
						docker stop frontend || true
						docker rm backend || true
						docker rm frontend || true
						docker pull backend:stable
						docker pull frontend:stable
						docker run -d --name backend --network backend-tier -p 8081:8081 backend:stable
						docker run -d --name frontend --network frontend-tier -p 3000:3000 frontend:stable
					'''
				}
			}
		}
	}
}
