use crate::jokes::Joke;

pub struct MedioJoke;

impl MedioJoke {
    pub fn new() -> Self {
        Self
    }
}

impl Joke for MedioJoke {
    fn get_joke(&self) -> String {
        "Van 2 y se cae el del medio".to_string()
    }

    fn get_responses(&self) -> Vec<String> {
        vec![]
    }
}
