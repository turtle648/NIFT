package com.e101.nift.common.security;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@ToString
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "admin")
public class AdminIpProperties {
    private List<String> allowedIps;
}