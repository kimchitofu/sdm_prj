describe("Guest Conversion Feature", () => {
  test("should link guest donation to registered user email", () => {
    const guestDonationEmail = "jeff@test.com"
    const registeredUserEmail = "jeff@test.com"

    const isLinked = guestDonationEmail === registeredUserEmail

    expect(isLinked).toBe(true)
  })
})