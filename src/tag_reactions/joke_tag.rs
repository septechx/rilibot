use anyhow::Result;
use serenity::{
    async_trait,
    model::{channel::Message, id::ChannelId},
    prelude::*,
};

use crate::{log, structs::Hook, Handler};

use super::TagHandler;

#[derive(Debug)]
pub struct JokeReplyHook {
    joke_channel_id: ChannelId,
}

impl JokeReplyHook {
    pub fn new(joke_channel_id: ChannelId) -> Box<Self> {
        Box::new(JokeReplyHook { joke_channel_id })
    }
}

#[async_trait]
impl Hook for JokeReplyHook {
    async fn run(&self, _state: &Handler, ctx: &Context, msg: &Message) -> bool {
        log::hook("JokeReply", self);

        if self.joke_channel_id == msg.channel_id && !msg.author.bot {
            log::hook_handle("JokeReply", self);
            msg.channel_id
                .say(&ctx.http, "Como que el otro?")
                .await
                .is_ok()
        } else {
            log::hook_unhandle("JokeReply", self);
            false
        }
    }
}

pub struct JokeHandler;

impl JokeHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl TagHandler for JokeHandler {
    fn should_handle(&self, msg: &Message) -> bool {
        let msg = msg.content.to_lowercase();
        msg.contains("chistoso") && msg.contains("chiste")
    }

    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        msg.channel_id
            .say(&ctx.http, "Que le dice un pez al otro?")
            .await?;

        let hooks = state.get_hooks();
        let mut hooks_guard = hooks.lock().await;
        hooks_guard.push(JokeReplyHook::new(msg.channel_id));

        Ok(())
    }
}
