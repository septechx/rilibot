use anyhow::Result;
use serenity::{async_trait, model::channel::Message, prelude::*};

use super::{args, CommandHandler};

use crate::Handler;

pub struct SayHandler;

impl SayHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl CommandHandler for SayHandler {
    fn get_usage(&self) -> &'static str {
        "$say ...message"
    }

    async fn handle(&self, _state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        println!("Handling say");

        let args = args(msg);

        msg.channel_id
            .say(&ctx.http, args.join(" "))
            .await
            .map(|_| ())?;

        Ok(())
    }
}
