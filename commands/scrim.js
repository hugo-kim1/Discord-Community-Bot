const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    var voice_ch = message.member.voiceChannel;
    var v_members = voice_ch.members;
    var members_array = [] ;

    for (const [memberID, member] of v_members) {
        members_array.push(member.user.tag);
    }

    var team1 = [];
    
    let rand = Math.random();
    let totalMemb = members_array.length;
    let randIndex = Math.floor(rand * totalMemb);
    let randomMemb = members_array[randIndex];
    team1.push(randomMemb);

    var team2 = [];
    var count1=Math.round(members_array.length)/2;
    do{
        let rand1 = Math.random();
        let totalMemb1 = members_array.length;
        let randIndex1 = Math.floor(rand1 * totalMemb1);
        var randomMemb1 = members_array[randIndex1];

        if (!team1.includes(randomMemb1)) {
            team1.push(randomMemb1);
        }
     } while (team1.length < count1);

    var count2 = (members_array.length - team1.length);
    do{
        let rand2 = Math.random();
        let totalMemb2 = members_array.length;
        let randIndex2 = Math.floor(rand2 * totalMemb2);
        var randomMemb2 = members_array[randIndex2];

        if (!team1.includes(randomMemb2)) {
            if(!team2.includes(randomMemb2)) {
                team2.push(randomMemb2);
            }
        }
    } while (team2.length < count2)

    let botembed1 = new Discord.RichEmbed()
    .setTitle(":regional_indicator_t: :regional_indicator_e: :regional_indicator_a: :regional_indicator_m: :a:")
    .setDescription(team1)
    .setColor("#0D76F5")

    let botembed2 = new Discord.RichEmbed()
    .setTitle(":regional_indicator_t: :regional_indicator_e: :regional_indicator_a: :regional_indicator_m: :b:")
    .setDescription(team2)
    .setColor("#FF5B1D")

    if (!voice_ch) {
        message.channel.send('음성채팅방에 들어가주세요');
    } else {
    message.channel.send(botembed1);
    message.channel.send(botembed2);
    }
}

module.exports.help = {
    name: "내전"
}