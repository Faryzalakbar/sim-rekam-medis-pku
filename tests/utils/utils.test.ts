import { formatCurrency, formatDate, calculateAge } from '@/lib/utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('Rp1.000')
      expect(formatCurrency(1500.50)).toBe('Rp1.501')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toContain('15')
      expect(formatted).toContain('Januari')
      expect(formatted).toContain('2024')
    })
  })

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date('1990-01-01')
      const age = calculateAge(birthDate)
      expect(age).toBeGreaterThan(30)
    })
  })
})
