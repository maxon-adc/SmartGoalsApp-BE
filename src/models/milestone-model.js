import mongoose from 'mongoose';
import { goalModel } from './goal-model';
import { mileStoneSchema } from '../schemas/milestone-schema';

const Milestone = mongoose.model('Milestone', mileStoneSchema);

const create = function (goalId, milestone) {
	return new Promise((resolve, reject) => {
		if (!goalId) {
			reject(new Error(`Argument goal id: "${goalId}" is invalid.`));
		} else if (!milestone) {
			reject(new Error(`Argument milestone: "${milestone}" is invalid.`));
		}

		goalModel.getSingle(goalId).then(goal => {
			if (!goal) {
				reject(new Error(`Goal with id "${goalId}" does not exist.`));
			} else {
				Milestone.create(milestone).then(newMilestone => {
					goal.milestones.push(newMilestone._id);

					goalModel.update(goalId, goal).then(() => {
						resolve(newMilestone);
					}).catch(err => {
						reject(err);
					});
				}).catch(err => {
					reject(err);
				});
			}
		}).catch(err => {
			reject(err);
		});
	});
};

const getAllByParent = function (goalId) {
	return new Promise((resolve, reject) => {
		if (!goalId) {
			reject(new Error(`Argument goal id: "${goalId}" is invalid.`));
		}

		goalModel.getSingle(goalId).then(goal => {
			resolve(goal.milestones);
		}).catch(err => {
			reject(err);
		});
	});
}

const getSingleByParent = function (id, goalId) {
	return new Promise((resolve, reject) => {
		if (!id) {
			reject(new Error(`Argument id: "${id}" is invalid.`));
		} else if (!goalId) {
			reject(new Error(`Argument goal id: "${goalId}" is invalid.`));
		}

		goalModel.getSingle(goalId).then(goal => {
			const milestone = goal.milestones.find(function(element) {
				return element._id.toString() === id.toString();
			});

			resolve(milestone);
		}).catch(err => {
			reject(err);
		})
	});
};

const update = function(id, milestone) {
	return new Promise((resolve, reject) => {
		if (!id) {
			reject(new Error(`Argument id: "${id}" is invalid.`));
		} else if (!milestone) {
			reject(new Error(`Argument milestone: "${milestone}" is invalid.`));
		}

		Milestone.findByIdAndUpdate(id, milestone).then(() => {
			resolve();
		}).catch(err => {
			reject(err);
		});
	});
};

const remove = function(id, goalId) {
	return new Promise((resolve, reject) => {
		if (!id) {
			reject(new Error(`Argument id: "${id}" is invalid.`));
		} if (!goalId) {
			reject(new Error(`Argument goal id: "${goalId}" is invalid.`));
		}

		goalModel.findById(goalId).then(goal => {
			goal.milestones.pull(deleteCriteria);

			goalModel.update(goalId, goal).then(updatedGoal => {
				Milestone.findByIdAndRemove(id).then(() => {
					resolve();
				}).catch(err => {
					reject(err);
				});
			}).catch(err => {
				reject(err);
			});
		});
	});
};

const checkIfExists = function (id) {
	return new Promise((resolve, reject) => {
		Milestone.find({_id: id}).then(milestones => {
			if (milestones && milestones.length !== 0) {
				resolve(true);
			} else {
				resolve(false);
			}
		}).catch(err => {
			reject(err);
		});
	});
};

const milestoneModel = {
	create: create,
	getSingleByParent: getSingleByParent,
	getAllByParent: getAllByParent,
	update: update,
	remove: remove,
	checkIfExists: checkIfExists
};

export {
	milestoneModel
};