use anyhow::Result;
use serenity::{async_trait, model::channel::Message, prelude::*};

use crate::{log, Handler, CLIENT_ID};

use super::MessageHandler;

pub struct TagHandler;

impl TagHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl MessageHandler for TagHandler {
    fn should_handle(&self, msg: &Message) -> bool {
        !msg.author.bot && msg.content.contains(&format!("<@{}>", *CLIENT_ID))
    }

    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        log::handler("Tag");

        state.tag_handlers.process_message(state, ctx, msg).await;

        Ok(())
    }
}
