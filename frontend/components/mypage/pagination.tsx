import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPage: number
  setCurrentPage: (page: number) => void
}

export function Pagination({ currentPage, totalPage, setCurrentPage }: PaginationProps) {
  const maxButtons = 5
  const start = Math.floor(currentPage / maxButtons) * maxButtons
  const end = Math.min(start + maxButtons, totalPage)

  return (
    <div className="mt-8 flex justify-center items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === 0}
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))}
      >
        ‹ 이전
      </Button>

      {Array.from({ length: end - start }, (_, i) => i + start).map((pageNum) => (
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? "default" : "ghost"}
          size="sm"
          onClick={() => setCurrentPage(pageNum)}
        >
          {pageNum + 1}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === totalPage - 1}
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPage - 1))}
      >
        다음 ›
      </Button>
    </div>
  )
}
