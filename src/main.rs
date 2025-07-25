mod commands;
mod db;
mod handlers;

use anyhow::Result;
use serenity::{
    async_trait,
    model::{channel::Message, gateway::Ready},
    prelude::*,
};

use std::env;

use commands::{CommandHandlerRegistry, HelpHandler, MuteHandler, SayHandler, UnmuteHandler};
use handlers::{CommandHandler, MessageHandlerRegistry, OtroHandler};

pub struct Handler {
    db_client: tokio_postgres::Client,
    message_handlers: MessageHandlerRegistry,
    command_handlers: CommandHandlerRegistry,
}

impl Handler {
    fn new(clt: tokio_postgres::Client) -> Self {
        let mut mhr = MessageHandlerRegistry::new();
        mhr.register(OtroHandler::new());
        mhr.register(CommandHandler::new());

        let mut chr = CommandHandlerRegistry::new();
        chr.register("say", SayHandler::new());
        chr.register("mute", MuteHandler::new());
        chr.register("unmute", UnmuteHandler::new());
        chr.register("help", HelpHandler::new());

        Self {
            db_client: clt,
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

    async fn ready(&self, _ctx: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let token = get_env_var("DISCORD_TOKEN");
    let intents = GatewayIntents::all();

    let db_client = db::connect().await?;

    let mut client = Client::builder(&token, intents)
        .event_handler(Handler::new(db_client))
        .await?;

    client.start().await?;

    Ok(())
}

pub fn get_env_var(key: &'static str) -> String {
    let err = format!("{key} env variable not found");
    env::var(key).expect(&err)
}
