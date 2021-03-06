const PushModel = require("../models/PushModel");
const moment = require("moment");
class Push {
	static githubPushEvent = async (req, res) => {
		try {
			const push = await PushModel.insertOne(req.body);
			res.status(201).json({ message: "successfully" });
		} catch (error) {
			console.log(
				"🚀 ~ file: githubController.js ~ line 9 ~ Push ~ githubEvent= ~ error",
				error
			);
			res.status(500).json({ message: "Internal server error" });
		}
	};

	static findAll = async (req, res) => {
		try {
			const { username } = req.query;
			let condition = {};
			if (username) condition = { ...condition, "pusher.name": username };
			const pushes = await PushModel.findAll(condition);
			res.status(200).json(pushes);
		} catch (error) {
			res.status(500).json({ error });
		}
	};

	static countCommitAndPush = async (req, res) => {
		try {
			const { orgName, repos, username } = req.query;

			let condition = {};

			if (orgName) {
				condition = { ...condition, "organization.login": orgName };
			}

			if (repos) {
				const _repos = repos.split(",");
				condition = { ...condition, "repository.name": _repos };
			}

			if (username) {
				condition = { ...condition, "pusher.name": username };
			}

			const pushes = await PushModel.findAll(condition);
			let commitCount = 0;
			let commitMessageText = "";
			let commitMessageAndDateText = "";
			let commitMessages = [];
			let commitMessagesAndDate = [];
			pushes.forEach((push) => {
				commitCount += push.commits.length;
				push.commits.forEach((commit) => {
					commitMessageText += `- ${commit.message} \n`;
					commitMessageAndDateText += `- ${moment(commit.timestamp).format(
						"ddd, DD-MM-YYYY hh:ss"
					)}: ${commit.message} \n`;
					commitMessages.push(commit.message);
					commitMessagesAndDate.push(
						`${moment(commit.timestamp).format("ddd, DD-MM-YYYY hh:ss")} - ${
							commit.message
						}`
					);
				});
			});
			const response = {
				orgName,
				repos,
				username,
				push: pushes.length,
				commit: commitCount,
				commitMessages,
				commitMessagesAndDate,
				commitMessageText,
				commitMessageAndDateText,
			};
			res.status(200).json(response);
		} catch (error) {
			res.status(500).json({ error });
		}
	};
}

module.exports = Push;
