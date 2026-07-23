/**
 * Service to aggregate project statistics (tasks completed, budget burned, etc.)
 */

/**
 * Stub project statistics aggregator
 * @param {Object} project 
 * @returns {Object} Calculated stats
 */
const calculateProjectStats = (project) => {
  return {
    totalTasks: project.tasks?.length || 0,
    completionPercentage: 0,
    remainingBudget: project.budget || 0
  };
};

module.exports = {
  calculateProjectStats
};
