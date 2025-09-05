mod commands;
mod db;
mod handlers;
mod jokes;
mod log;
mod structs;
mod tag_reactions;

use anyhow::Result;
use lazy_static::lazy_static;
use serenity::{
    all::ActivityData,
    async_trait,
    model::{channel::Message, gateway::Ready},
    prelude::*,
};

use std::{env, sync::Arc};

use commands::{
    CommandHandlerRegistry, HelpCommand, MuteCommand, RoleCommand, SayCommand, UnmuteCommand,
    VanCommand,
};
use handlers::{CommandHandler, MessageHandlerRegistry, OtroHandler, TagHandler};
use structs::Hook;
use tag_reactions::{JokeHandler, TagHandlerRegistry};

use crate::jokes::{JokeRegistry, MedioJoke, PezJoke, SemaforoJoke};

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
    jokes: JokeRegistry,
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
        chr.register("say", SayCommand::new());
        chr.register("mute", MuteCommand::new());
        chr.register("unmute", UnmuteCommand::new());
        chr.register("help", HelpCommand::new());
        chr.register("role", RoleCommand::new());
        chr.register("van", VanCommand::new());

        let mut jr = JokeRegistry::new();
        jr.register(PezJoke::new());
        jr.register(MedioJoke::new());
        jr.register(SemaforoJoke::new());

        Self {
            db_client: clt,
            hooks: Arc::new(Mutex::new(Vec::new())),
            message_handlers: mhr,
            tag_handlers: thr,
            command_handlers: chr,
            jokes: jr,
        }
    }

    pub fn get_hooks(&self) -> Arc<Mutex<Vec<Box<dyn Hook>>>> {
        Arc::clone(&self.hooks)
    }
}

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, ctx: Context, msg: Message) {
        // Process hooks first to avoid a hook being called on the same message it was spawned from
        let hooks_vec = {
            let mut guard = self.hooks.lock().await;
            std::mem::take(&mut *guard)
        };

        let mut remaining = Vec::new();
        for hook in hooks_vec {
            if !hook.run(self, &ctx, &msg).await {
                remaining.push(hook);
            }
        }

        {
            let mut guard = self.hooks.lock().await;
            *guard = remaining;
        }

        self.message_handlers
            .process_message(self, &ctx, &msg)
            .await;
    }

    async fn ready(&self, _ctx: Context, ready: Ready) {
        log::info(&format!("{} is connected!", ready.user.name));
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    let intents = GatewayIntents::all();

    let db_client = db::connect().await?;

    let mut client = Client::builder(&*TOKEN, intents)
        .event_handler(Handler::new(db_client))
        .activity(ActivityData::playing("rb.siesque.com | $help"))
        .await?;

    client.start().await?;

    Ok(())
}

pub fn get_env_var(key: &'static str) -> String {
    let err = format!("{key} env variable not found");
    env::var(key).expect(&err)
}
