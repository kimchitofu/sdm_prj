"use client";

export default function TestPage() {
  const testConnection = async () => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'testuser999@example.com',
          password: 'Test1234',
          firstName: 'Test',
          lastName: 'User',
          role: 'donee',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(`SQLite + Prisma connected. User created: ${data.email}`)
      } else {
        alert(`Response: ${data.error}`)
      }
    } catch (error: any) {
      alert(error.message)
      console.error(error)
    }
  };

  return (
    <div>
      <h1>SQLite + Prisma Test</h1>
      <button onClick={testConnection}>Test DB Connection</button>
    </div>
  );
}
