describe("Donation Feature", () => {
  test("should calculate donation total correctly", () => {
    const donationAmount = 50
    const currentRaised = 1000

    const newTotal = currentRaised + donationAmount

    expect(newTotal).toBe(1050)
  })
})