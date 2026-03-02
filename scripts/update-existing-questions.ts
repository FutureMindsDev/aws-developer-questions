import { getDatabase } from "../lib/mongodb";

async function updateExistingQuestions() {
  try {
    const db = await getDatabase();
    const questionsCollection = db.collection("questions");

    // Find all questions that don't have an examType field
    const questionsWithoutExamType = await questionsCollection
      .find({
        examType: { $exists: false },
      })
      .toArray();

    console.log(
      `Found ${questionsWithoutExamType.length} questions without examType`,
    );

    if (questionsWithoutExamType.length > 0) {
      // Update all questions without examType to have "aws-developer" as default
      const result = await questionsCollection.updateMany(
        { examType: { $exists: false } },
        { $set: { examType: "aws-developer" } },
      );

      console.log(
        `Successfully updated ${result.modifiedCount} questions with examType="aws-developer"`,
      );
    } else {
      console.log("All questions already have examType field");
    }
  } catch (error) {
    console.error("Error updating questions:", error);
  } finally {
    process.exit(0);
  }
}

// Run the update function
updateExistingQuestions();
