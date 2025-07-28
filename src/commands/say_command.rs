use anyhow::Result;
use serenity::{async_trait, model::channel::Message, prelude::*};

use super::{CommandHandler, args};

use crate::Handler;

pub struct SayCommand;

impl SayCommand {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl CommandHandler for SayCommand {
    fn get_usage(&self) -> &'static str {
        "$say ...message"
    }

    async fn handle(&self, _state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        let args = args(msg);

        msg.channel_id
            .say(&ctx.http, args.join(" "))
            .await
            .map(|_| ())?;

        Ok(())
    }
}
