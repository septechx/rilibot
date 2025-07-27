use anyhow::Result;
use serenity::{async_trait, model::channel::Message, prelude::*};

use crate::Handler;

use super::MessageHandler;

pub struct OtroHandler;

impl OtroHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl MessageHandler for OtroHandler {
    fn should_handle(&self, msg: &Message) -> bool {
        !msg.author.bot && msg.content.to_lowercase().contains("otro")
    }

    async fn handle(&self, _handler: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        println!("El otro handler called");

        msg.channel_id.say(&ctx.http, "Como que el otro?").await?;

        Ok(())
    }
}
