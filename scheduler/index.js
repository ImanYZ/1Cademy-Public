const { assignNodeContributorsInstitutionsStats } = require("./assignNodeContributorsInstitutionsStats");
const { updateInstitutions } = require("./updateInstitutions");

// Retrieve Job-defined env vars
const { CLOUD_RUN_TASK_ATTEMPT = 0 } = process.env;
// Retrieve User-defined env vars
const CLOUD_RUN_TASK_INDEX = parseInt(process.env.CLOUD_RUN_TASK_INDEX || "0");

const main = async () => {
  console.log(`Starting Task #${CLOUD_RUN_TASK_INDEX}, Attempt #${CLOUD_RUN_TASK_ATTEMPT}...`);

  if (CLOUD_RUN_TASK_INDEX === 0) {
    console.log("Task: Update institutions");
    await updateInstitutions(true);
    console.log("Done Task: Update institutions");

    console.log("Task: Assign Node Contributors Institutions Stats");
    await assignNodeContributorsInstitutionsStats(true);
    console.log("Done Task: Assign Node Contributors Institutions Stats");
  }
  console.log(`Completed Task #${CLOUD_RUN_TASK_INDEX}.`);
};

main()
  .then(() => {
    console.log("Done every 25 hours scheduler");
    process.exit();
  })
  .catch(err => {
    console.log("Error occurred in 25 hour scheduler:", err);
    console.error(err);
    process.exit(1); // Retry Job Task by exiting the process
  });
