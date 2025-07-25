mod help_command;
mod mute_command;
mod say_command;
mod unmute_command;

use anyhow::{bail, Result};
use serenity::{async_trait, model::channel::Message, prelude::*};

use std::collections::HashMap;

pub use help_command::HelpHandler;
pub use mute_command::MuteHandler;
pub use say_command::SayHandler;
pub use unmute_command::UnmuteHandler;

use crate::Handler;

#[async_trait]
pub trait CommandHandler: Send + Sync {
    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> serenity::Result<()>;
    fn get_usage(&self) -> &'static str;
}

pub struct CommandHandlerRegistry {
    handlers: HashMap<&'static str, Box<dyn CommandHandler>>,
}

impl CommandHandlerRegistry {
    pub fn new() -> Self {
        Self {
            handlers: HashMap::new(),
        }
    }

    pub fn register<H: CommandHandler + 'static>(&mut self, name: &'static str, handler: H) {
        self.handlers.insert(name, Box::new(handler));
    }

    pub async fn process_command(
        &self,
        state: &Handler,
        ctx: &Context,
        msg: &Message,
        name: &String,
    ) -> serenity::Result<()> {
        match self.handlers.get(name.as_str()) {
            Some(ch) => {
                if let Err(err) = ch.handle(state, ctx, msg).await {
                    eprintln!("Error in command handler {name}: {err:?}");
                }
            }
            None => {
                eprintln!("Command not found: {name}");
            }
        };

        Ok(())
    }
}

pub fn args(msg: &Message) -> Vec<&str> {
    let parts: Vec<_> = msg.content.strip_prefix("$").unwrap().split(' ').collect();
    parts[1..].to_vec()
}

pub async fn args_checked<'a>(
    ctx: &Context,
    msg: &'a Message,
    expected_len: usize,
    usage_s: &'static str,
) -> Result<Vec<&'a str>> {
    let args = args(msg);

    if args.len() != expected_len {
        msg.channel_id.say(&ctx.http, usage(usage_s)).await?;

        bail!(
            "Expected {} arguments, received {}",
            expected_len,
            args.len()
        );
    }

    Ok(args)
}

pub fn usage(s: &'static str) -> String {
    format!("Usage: {s}")
}

pub async fn send_usage(ctx: &Context, msg: &Message, usage_msg: String) -> serenity::Result<()> {
    msg.channel_id.say(&ctx.http, usage_msg).await?;
    Ok(())
}

pub async fn send_error(ctx: &Context, msg: &Message, err: &str) -> serenity::Result<()> {
    msg.channel_id.say(&ctx.http, err).await?;
    Ok(())
}
