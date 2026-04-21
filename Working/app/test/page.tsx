"use client";

import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

// 👉 ADD THESE
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

export default function TestPage() {
  const testFirebase = async () => {
    try {
      // 1️⃣ Test Auth
      const user = await createUserWithEmailAndPassword(
        auth,
        "testuser999@gmail.com",
        "123456"
      );

      // 2️⃣ Test Database (THIS IS NEW)
      await set(ref(db, "test/message"), {
        text: "Hello Firebase DB"
      });

      alert("Firebase Auth + DB connected ✅");
    } catch (error: any) {
      alert(error.message);
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Firebase Test</h1>
      <button onClick={testFirebase}>Test Firebase</button>
    </div>
  );
}