use anyhow::Result;
use serenity::{async_trait, model::channel::Message, prelude::*};

use crate::Handler;

use super::TagHandler;

pub struct JokeHandler;

impl JokeHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl TagHandler for JokeHandler {
    fn should_handle(&self, msg: &Message) -> bool {
        let msg = msg.content
            .to_lowercase();
        msg.contains("chistoso") && msg.contains("chiste")
            
    }

    async fn handle(&self, _handler: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        msg.channel_id
            .say(&ctx.http, "Que le dice un pez al otro?")
            .await?;

        Ok(())
    }
}
