const { default: axios } = require("axios");
const { execute } = require("./reactionRoles");

module.exports = {
  name: "withdrawal-receipt",
  description:
    "New world does not offer in game tracking of who removes company funds. This command, when used, will allow users to track their withdrawals. Not automatically, unfortunatley, but they will be able to command the bot to track how much they removed, when, and the total amount in which they have removed.",
  async execute(message, args, Discord, client) {
    let textChannel = process.env.WITHDRAWAL_RECEIPT_CHANNEL_ID;
    let serverUrl = "http://localhost:3001";
    let withdrawalNumber = parseFloat(args);
    if (message.channel.id === textChannel) {
      if (Number.isFinite(withdrawalNumber) && withdrawalNumber > 0) {
        let user = message.author.username;
        let user_id = message.author.id;

        let userWithdrawal = {
          name: user,
          discordId: user_id,
          withdrawalAmount: withdrawalNumber,
          approved: false,
          messageId: message.id,
        };

        axios.post(`${serverUrl}/withdrawals`, userWithdrawal).then((res) => {
          let embed = new Discord.MessageEmbed()
            .setColor("#e42643")
            .setTitle(`Thank you ${res.data.user} for reporting your withdrawal!\n\n`)
            .setDescription(`Amount withdrawn: ${res.data.withdrawal}`);
          message.channel.send(embed);
        });
      } else
        message.reply(
          "Please enter the correct format for your withdrawal: !withdrawal *-only numbers here-* example: !withdrawal 500"
        );
    } else return;
  },
  async getUsertotal(message, args, Discord, client) {
    let textChannel = process.env.WITHDRAWAL_RECEIPT_CHANNEL_ID;

    function run(user) {
      let discordId = user.id;

      let serverUrl = "http://localhost:3001";

      let userInfo = {
        id: discordId,
      };

      axios
        .post(`${serverUrl}/withdrawaltotals`, userInfo)
        .then((res) => {
          let user = res.data[0].name;
          let totalWithdrawals = res.data[0].totalWithdrawal;

          let embed = new Discord.MessageEmbed()
            .setColor("#e42643")
            .setTitle(`${user}'s Total withdrawal amount!\n\n`)
            .setDescription(`${totalWithdrawals} 🪙's`);
          message.channel.send(embed);
        })
        .catch((err) => {
          message.reply(err.response.data.message);
        });
    }
    if (message.channel.id === textChannel) {
      let stored = message.mentions.users.entries().next().value;
      if (stored) {
        message.mentions.users.forEach((user) => {
          run(user);
        });
      } else {
        run(message.author);
      }
    }
  },
  async getLeaderboard(message, args, Discord, client) {
    let textChannel = process.env.WITHDRAWAL_RECEIPT_CHANNEL_ID;
    let serverUrl = "http://localhost:3001";
    if (message.channel.id === textChannel) {
      axios
        .get(`${serverUrl}/withdrawalleaderboard`)
        .then((res) => {
          let resData = Object.entries(res.data).sort((a, b) => {
            return b[1] - a[1];
          });
          if (resData.length > 5) {
            let str = ``;
            let count = 0;
            let topLeaders = resData.slice(0, 5);
            topLeaders.forEach((user) => {
              str += `#${(count += 1)} ${user[0]}: ${user[1]}\n\n`;
            });
            let embed = new Discord.MessageEmbed()
              .setColor("#e42643")
              .setTitle(`Top withdrawers for Touching Tips!\n\n`)
              .setDescription(str);
            message.channel.send(embed);
          } else {
            let str = ``;
            let count = 0;
            resData.forEach((user) => {
              str += `#${(count += 1)} ${user[0]}: ${user[1]}\n\n`;
            });
            let embed = new Discord.MessageEmbed()
              .setColor("#e42643")
              .setTitle(`Top withdrawers for Touching Tips!\n\n`)
              .setDescription(str);
            message.channel.send(embed);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else return;
  },
  async withdrawalReaction(message, client) {
    let acceptedEmoji = "✅";
    let channel = process.env.WITHDRAWAL_RECEIPT_CHANNEL_ID;
    client.on("messageReactionAdd", async (reaction, user) => {
      if (reaction.message.channel.id === channel) {
        if (reaction.emoji.name === acceptedEmoji) {
          let serverUrl = "http://localhost:3001";
          let messageId = { messageId: reaction.message.id };
          axios
            .post(`${serverUrl}/approved`, messageId)
            .then((res) => {
              console.log(res);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
    });
  },
};
