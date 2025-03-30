const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed, MessageAttachment } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const fs = require('fs'); // For sound files

let debateState = {
    participants: [],
    currentSpeaker: 0,
    votes: {},
    timer: null,
    timeLeft: 120, // 2 minutes
};

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'startdebate') {
        // Initialize debate
        debateState.participants = interaction.options.getString('participants').split(',');
        debateState.votes = {};
        debateState.currentSpeaker = 0;
        debateState.timeLeft = 120;

        const embed = new MessageEmbed()
            .setTitle('Debate Started')
            .setDescription(`Participants: ${debateState.participants.join(', ')}`)
            .setColor('BLUE');

        await interaction.reply({ embeds: [embed] });
        startDebate(interaction.channel);
    }
});

async function startDebate(channel) {
    const participant = debateState.participants[debateState.currentSpeaker];
    const embed = new MessageEmbed()
        .setTitle('Debate in Progress')
        .setDescription(`${participant}'s turn to speak!`)
        .setColor('GREEN');

    const timerMessage = await channel.send({ embeds: [embed] });

    const updateTimer = async () => {
        const timerEmbed = new MessageEmbed()
            .setTitle('Time Remaining')
            .setDescription(`${debateState.timeLeft} seconds left`)
            .setColor('ORANGE');
        await timerMessage.edit({ embeds: [embed, timerEmbed] });
    };

    updateTimer();
    debateState.timer = setInterval(async () => {
        debateState.timeLeft -= 1;
        if (debateState.timeLeft > 0) {
            updateTimer();
        } else {
            clearInterval(debateState.timer);
            await channel.send({
                content: '⏰ Time is up!',
                files: [new MessageAttachment('./time_up_sound.mp3')], // Add sound
            });

            debateState.currentSpeaker += 1;
            if (debateState.currentSpeaker < debateState.participants.length) {
                debateState.timeLeft = 120;
                startDebate(channel);
            } else {
                startVoting(channel);
            }
        }
    }, 1000);
}

async function startVoting(channel) {
    const embed = new MessageEmbed()
        .setTitle('Voting Time')
        .setDescription('Vote for the best argument!')
        .setColor('YELLOW');

    const row = new MessageActionRow()
        .addComponents(
            debateState.participants.map((participant, index) =>
                new MessageButton()
                    .setCustomId(`vote_${index}`)
                    .setLabel(participant)
                    .setStyle('PRIMARY')
            )
        );

    await channel.send({ embeds: [embed], components: [row] });

    setTimeout(() => {
        displayResults(channel);
    }, 30000); // 30 seconds for voting
}

async function displayResults(channel) {
    const voteCounts = debateState.participants.map((_, index) =>
        Object.values(debateState.votes).filter((vote) => vote == index).length
    );

    const winnerIndex = voteCounts.indexOf(Math.max(...voteCounts));
    const winner = debateState.participants[winnerIndex];

    const embed = new MessageEmbed()
        .setTitle('Debate Results')
        .setDescription(`🏆 Winner: ${winner}`)
        .addFields(
            debateState.participants.map((participant, index) => ({
                name: participant,
                value: `${voteCounts[index]} votes`,
                inline: true,
            }))
        )
        .setColor('GOLD');

    await channel.send({ embeds: [embed] });
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const [action, index] = interaction.customId.split('_');
    if (action === 'vote') {
        const voter = interaction.user.id;
        debateState.votes[voter] = index;

        await interaction.reply({ content: 'Vote recorded!', ephemeral: true });
    }
});

client.login('MTMxMjcxMzkzNjE1NTU3ODQ1OQ.GVh_6o.OuXT6rrZdYxJjqWp5Lm9_TcLBXb9VsGvA_arTM');
