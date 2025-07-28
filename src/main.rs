mod commands;
mod db;
mod handlers;
mod structs;
mod tag_reactions;

use anyhow::Result;
use lazy_static::lazy_static;
use serenity::{
    async_trait,
    model::{channel::Message, gateway::Ready},
    prelude::*,
};
use tokio::sync::Mutex;

use std::{env, sync::Arc};

use commands::{CommandHandlerRegistry, HelpHandler, MuteHandler, SayHandler, UnmuteHandler};
use handlers::{CommandHandler, MessageHandlerRegistry, OtroHandler, TagHandler};
use structs::Hook;
use tag_reactions::{JokeHandler, TagHandlerRegistry};

lazy_static! {
    pub static ref CLIENT_ID: String = get_env_var("DISCORD_CLIENT_ID");
    pub static ref TOKEN: String = get_env_var("DISCORD_TOKEN");
    // db related env varables are in src/db/mod.rs
}

pub struct Handler {
    db_client: tokio_postgres::Client,
    hooks: Arc<Mutex<Vec<Box<dyn Hook>>>>,
    message_handlers: MessageHandlerRegistry,
    command_handlers: CommandHandlerRegistry,
    tag_handlers: TagHandlerRegistry,
}

impl Handler {
    fn new(clt: tokio_postgres::Client) -> Self {
        let mut mhr = MessageHandlerRegistry::new();
        mhr.register(OtroHandler::new());
        mhr.register(CommandHandler::new());
        mhr.register(TagHandler::new());

        let mut thr = TagHandlerRegistry::new();
        thr.register(JokeHandler::new());

        let mut chr = CommandHandlerRegistry::new();
        chr.register("say", SayHandler::new());
        chr.register("mute", MuteHandler::new());
        chr.register("unmute", UnmuteHandler::new());
        chr.register("help", HelpHandler::new());

        Self {
            db_client: clt,
            hooks: Arc::new(Mutex::new(Vec::new())),
            message_handlers: mhr,
            tag_handlers: thr,
            command_handlers: chr,
        }
    }

    pub fn get_hooks(&self) -> Arc<Mutex<Vec<Box<dyn Hook>>>> {
        Arc::clone(&self.hooks)
    }
}

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, ctx: Context, msg: Message) {
        self.message_handlers
            .process_message(self, &ctx, &msg)
            .await;

        let mut hooks = self.hooks.lock().await;

        let mut remaining_hooks = Vec::new();

        for hook in hooks.drain(..) {
            if !hook.run(self, &ctx, &msg).await {
                remaining_hooks.push(hook);
            }
        }

        *hooks = remaining_hooks;
    }

    async fn ready(&self, _ctx: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let intents = GatewayIntents::all();

    let db_client = db::connect().await?;

    let mut client = Client::builder(&*TOKEN, intents)
        .event_handler(Handler::new(db_client))
        .await?;

    client.start().await?;

    Ok(())
}

pub fn get_env_var(key: &'static str) -> String {
    let err = format!("{key} env variable not found");
    env::var(key).expect(&err)
}
