const botconfig = require("./config.json");
const { PREFIX, GOOGLE_API_KEY } = require('./config.json');
const { Client, Util } = require("discord.js");
const Discord = require("discord.js");
const fs = require("fs");
const time = new Date();
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

const bot = new Client({disableEveryone: true});

const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();

bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    if(err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if(jsfile.length <= 0){
        console.log("Couldn't find commands.");
        return;
    }

    jsfile.forEach((f, i) =>{
        let props = require('./commands/'+f);
        console.log(f+' loaded!');
        bot.commands.set(props.help.name, props);
    });
});

bot.on('ready', async () => {

    console.log(bot.user.username +' is online!');
    bot.user.setActivity("열일")
})

bot.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type ==="dm") return;

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    if(cmd.startsWith('흠')
    ||cmd.endsWith('흠')
    ||cmd.startsWith('음')) {
        message.channel.send(':thinking:')
    }

    if(cmd.startsWith('굿')
    ||cmd.endsWith('굿')
    ||cmd.startsWith('굳')
    ||cmd.endsWith('굳')) {
        message.channel.send(':thumbsup:')
    }

    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args)
    
    if(!(message.attachments.array().length === 0)) {
        user_ = message.author.username
        let embed_ = new Discord.RichEmbed()
        .setTitle("By  " + user_)
        .setColor("#00FFFF")
        .setFooter("At " + time.getFullYear() + "년 " + time.getMonth() + "월 " + time.getDate() + "일 | " + time.getHours() + "시 " + time.getMinutes() + "분 " + time.getSeconds() + "초")
        .setImage(message.attachments.array()[0].url)

        let channel1 = botconfig.channel_collect_pics;        
        bot.channels.get(channel1).send(embed_)
    }

})

bot.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(PREFIX)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(PREFIX.length)

	if (command === '재생') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('음악을 재생하려면 음성 채널에 입장해야 합니다!');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return msg.channel.send(`✅ 플레이리스트: **${playlist.title}** 리스트에 추가되었습니다!`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					msg.channel.send(`
__**Song selection:**__

${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}

Please provide a value to select one of the search results ranging from 1-10.
					`);
					// eslint-disable-next-line max-depth
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('유효하지 않은 값이 입력되었습니다. 검색을 중지합니다.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('🆘 검색 결과가 없습니다.');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === '스킵') {
		if (!msg.member.voiceChannel) return msg.channel.send('음악을 재생하려면 음성 채널에 입장해야 합니다!');
		if (!serverQueue) return msg.channel.send('스킵할 노래가 없습니다.');
		serverQueue.connection.dispatcher.end('스킵 입력 완료!');
		return undefined;
	} else if (command === '정지') {
		if (!msg.member.voiceChannel) return msg.channel.send('음악을 재생하려면 음성 채널에 입장해야 합니다!');
		if (!serverQueue) return msg.channel.send('정지할 노래가 없습니다.');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('정지 입력 완료!');
		return undefined;
	} else if (command === '음량') {
		if (!msg.member.voiceChannel) return msg.channel.send('음악을 재생하려면 음성 채널에 입장해야 합니다!');
		if (!serverQueue) return msg.channel.send('재생 중인 노래가 없습니다.');
		if (!args[1]) return msg.channel.send(`현재 음량은: **${serverQueue.volume}**`);
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
		return msg.channel.send(`음량을 다음으로 맞춥니다: **${args[1]}**`);
	} else if (command === '재생중') {
		if (!serverQueue) return msg.channel.send('재생 중인 노래가 없습니다.');
		return msg.channel.send(`🎶 재생 중: **${serverQueue.songs[0].title}**`);
	} else if (command === '리스트') {
		if (!serverQueue) return msg.channel.send('재생 중인 노래가 없습니다.');
		return msg.channel.send(`
__**Song queue:**__

${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}

**Now playing:** ${serverQueue.songs[0].title}
		`);
	} else if (command === 'pp') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('⏸ 일시정지 완료!');
		}
		return msg.channel.send('재생 중인 노래가 없습니다.');
	} else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('▶ 다시 재생 완료!');
		}
		return msg.channel.send('재생 중인 노래가 없습니다.');
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`봇이 음성채널에 들어갈 수 없습니다: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`봇이 음성채널에 들어갈 수 없습니다: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`✅ **${song.title}** 플레이리스트에 추가 완료!`);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`🎶 재생 시작: **${song.title}**`);
}


bot.login(botconfig.token);