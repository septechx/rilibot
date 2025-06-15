use serenity::{async_trait, model::channel::Message, prelude::*};

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
        !msg.author.bot && msg.content.contains("otro")
    }

    async fn handle(&self, ctx: &Context, msg: &Message) -> serenity::Result<()> {
        msg.channel_id
            .say(&ctx.http, "Como que el otro?")
            .await
            .map(|_| ())
    }
}
