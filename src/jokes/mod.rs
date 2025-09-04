mod medio_joke;
mod pez_joke;

use rand::Rng;
use serenity::async_trait;

pub use medio_joke::MedioJoke;
pub use pez_joke::PezJoke;

#[async_trait]
pub trait Joke: Send + Sync {
    fn get_joke(&self) -> String;
    fn get_responses(&self) -> Vec<String>;
}

pub struct JokeRegistry {
    handlers: Vec<Box<dyn Joke>>,
}

impl JokeRegistry {
    pub fn new() -> Self {
        Self {
            handlers: Vec::new(),
        }
    }

    pub fn register<H: Joke + 'static>(&mut self, handler: H) {
        self.handlers.push(Box::new(handler));
    }

    pub fn get_random_joke(&self) -> &dyn Joke {
        let index = rand::rng().random_range(0..self.handlers.len());
        self.handlers[index].as_ref()
    }
}
