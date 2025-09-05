use crate::jokes::Joke;

pub struct PezJoke;

impl PezJoke {
    pub fn new() -> Self {
        Self
    }
}

impl Joke for PezJoke {
    fn get_joke(&self) -> String {
        "Que le dice un pez al otro".to_string()
    }

    fn get_responses(&self) -> Vec<String> {
        vec!["Nada".to_string()]
    }
}
