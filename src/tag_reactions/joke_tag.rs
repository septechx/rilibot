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
    joke_replies: Vec<String>,
    joke_channel_id: ChannelId,
}

impl JokeReplyHook {
    pub fn new(joke_channel_id: ChannelId, joke_replies: Vec<String>) -> Self {
        Self {
            joke_replies,
            joke_channel_id,
        }
    }
}

#[async_trait]
impl Hook for JokeReplyHook {
    async fn run(&self, state: &Handler, ctx: &Context, msg: &Message) -> bool {
        log::hook("JokeReply", self);

        if self.joke_channel_id == msg.channel_id && !msg.author.bot {
            log::hook_handle("JokeReply", self);

            if self.joke_replies.is_empty() {
                return true;
            }

            let hook = JokeReplyHook::new(self.joke_channel_id, self.joke_replies[1..].to_vec());

            let hooks = state.get_hooks();

            {
                let mut hooks_guard = hooks.lock().await;
                hooks_guard.push(Box::new(hook));
            }

            msg.channel_id
                .say(&ctx.http, &self.joke_replies[0])
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
        let joke = state.jokes.get_random_joke();

        msg.channel_id.say(&ctx.http, joke.get_joke()).await?;

        let hook = JokeReplyHook::new(msg.channel_id, joke.get_responses());

        let hooks = state.get_hooks();

        {
            let mut hooks_guard = hooks.lock().await;
            hooks_guard.push(Box::new(hook));
        }

        Ok(())
    }
}
