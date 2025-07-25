mod commands;
mod handlers;

use serenity::{
    async_trait,
    model::{channel::Message, gateway::Ready},
    prelude::*,
};

use std::env;

use commands::{CommandHandlerRegistry, HelpHandler, MuteHandler, SayHandler, UnmuteHandler};
use handlers::{CommandHandler, MessageHandlerRegistry, OtroHandler};

pub struct Handler {
    message_handlers: MessageHandlerRegistry,
    command_handlers: CommandHandlerRegistry,
}

impl Handler {
    fn new() -> Self {
        let mut mhr = MessageHandlerRegistry::new();
        mhr.register(OtroHandler::new());
        mhr.register(CommandHandler::new());

        let mut chr = CommandHandlerRegistry::new();
        chr.register("say", SayHandler::new());
        chr.register("mute", MuteHandler::new());
        chr.register("unmute", UnmuteHandler::new());
        chr.register("help", HelpHandler::new());

        Self {
            message_handlers: mhr,
            command_handlers: chr,
        }
    }
}

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, ctx: Context, msg: Message) {
        self.message_handlers
            .process_message(self, &ctx, &msg)
            .await;
    }

    async fn ready(&self, _: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }
}

#[tokio::main]
async fn main() {
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");

    let intents = GatewayIntents::GUILD_MESSAGES
        | GatewayIntents::DIRECT_MESSAGES
        | GatewayIntents::MESSAGE_CONTENT;

    let mut client = Client::builder(&token, intents)
        .event_handler(Handler::new())
        .await
        .expect("Err creating client");

    if let Err(err) = client.start().await {
        println!("Client error: {err:?}");
    }
}
