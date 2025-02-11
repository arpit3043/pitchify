import json
import random
import datetime
from faker import Faker
from rich.console import Console
from rich.table import Table
from typing import List, Dict, Any, Optional

class PostGenerationObserver:
    def update(self, message: str) -> None:
        pass

class ConsoleObserver:
    def __init__(self):
        self.console = Console()

    def update(self, message: str) -> None:
        self.console.print(f"[blue]EVENT:[/blue] {message}")

class PostRepository:
    def __init__(self):
        self.posts: List[Dict[str, Any]] = []

    def add(self, post: Dict[str, Any]) -> None:
        try:
            self.posts.append(post)
        except Exception as e:
            print(f"Error adding post: {e}")

    def get_all(self) -> List[Dict[str, Any]]:
        try:
            return self.posts.copy()
        except Exception as e:
            print(f"Error retrieving posts: {e}")
            return []

    def clear(self) -> None:
        try:
            self.posts.clear()
        except Exception as e:
            print(f"Error clearing posts: {e}")

class PostGenerator:
    def __init__(self, repository: PostRepository):
        self.repository = repository
        self.faker = Faker()
        self.observers: List[PostGenerationObserver] = []

    def add_observer(self, observer: PostGenerationObserver) -> None:
        self.observers.append(observer)

    def notify_observers(self, message: str) -> None:
        for observer in self.observers:
            observer.update(message)

    def generate_post(self) -> Dict[str, Any]:
        try:
            post = {
                "author": self.faker.uuid4(),
                "content": self.faker.sentence(),
                "media": [self.faker.image_url() for _ in range(random.randint(0, 3))],
                "likes": [self.faker.uuid4() for _ in range(random.randint(0, 10))],
                "hashtags": [self.faker.word() for _ in range(random.randint(1, 5))],
                "shares": random.randint(0, 100),
                "comments": [
                    {
                        "user": self.faker.uuid4(),
                        "comment": self.faker.sentence(),
                        "timestamp": datetime.datetime.now().isoformat(),
                    }
                    for _ in range(random.randint(0, 5))
                ],
                "timestamp": datetime.datetime.now().isoformat(),
            }
            self.repository.add(post)
            self.notify_observers(f"Generated new post by {post['author']}")
            return post
        except Exception as e:
            print(f"Error generating post: {e}")
            return {}

    def generate_posts(self, count: int) -> List[Dict[str, Any]]:
        try:
            posts = [self.generate_post() for _ in range(count)]
            self.notify_observers(f"Generated {count} posts")
            return posts
        except Exception as e:
            print(f"Error generating multiple posts: {e}")
            return []

class ConsoleDisplay:
    def __init__(self):
        self.console = Console()

    def display_posts(self, posts: List[Dict[str, Any]]):
        try:
            table = Table(title="Generated Posts")
            table.add_column("Author", style="cyan")
            table.add_column("Content", style="green")
            table.add_column("Likes", style="magenta")
            table.add_column("Shares", style="blue")
            table.add_column("Comments", style="white")

            for post in posts:
                table.add_row(
                    post.get("author", "N/A"),
                    post.get("content", "N/A"),
                    str(len(post.get("likes", []))),
                    str(post.get("shares", 0)),
                    str(len(post.get("comments", []))),
                )

            self.console.print(table)
        except Exception as e:
            print(f"Error displaying posts: {e}")

def main():
    try:
        repository = PostRepository()
        post_generator = PostGenerator(repository)
        display_service = ConsoleDisplay()

        console_observer = ConsoleObserver()
        post_generator.add_observer(console_observer)

        num_posts = int(input("Enter the number of fake posts to generate: "))
        if num_posts < 1:
            raise ValueError("Number of posts must be positive")

        posts = post_generator.generate_posts(num_posts)
        display_service.display_posts(posts)
    except ValueError as e:
        print(f"Invalid input: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
