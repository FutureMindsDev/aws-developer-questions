import { getDatabase } from "../lib/mongodb";
import type { ExamType } from "../lib/types";

const initialExamTypes: Omit<ExamType, "_id">[] = [
  {
    id: "1",
    name: "aws-developer",
    displayName: "AWS Developer",
    description: "AWS Certified Developer - Associate (DVA-C02) exam questions",
    createdAt: new Date(),
    active: true,
  },
  {
    id: "2",
    name: "lpic-1",
    displayName: "LPIC-1",
    description:
      "Linux Professional Institute Certification Level 1 exam questions",
    createdAt: new Date(),
    active: true,
  },
];

async function seedExamTypes() {
  try {
    const db = await getDatabase();
    const collection = db.collection("examTypes");

    // Check if exam types already exist
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log("Exam types already exist. Skipping seeding.");
      return;
    }

    // Insert initial exam types
    const result = await collection.insertMany(initialExamTypes);
    console.log(`Successfully seeded ${result.insertedCount} exam types:`);

    initialExamTypes.forEach((examType) => {
      console.log(`- ${examType.displayName} (${examType.name})`);
    });
  } catch (error) {
    console.error("Error seeding exam types:", error);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedExamTypes();
