import json
import random
import base64
from faker import Faker
from pathlib import Path
from rich.table import Table
from rich.console import Console
from dataclasses import dataclass
from abc import ABC, abstractmethod
from cryptography.fernet import Fernet
from typing import List, Optional, Dict, Any, Protocol


class UserGenerationObserver(Protocol):
    def update(self, message: str) -> None:
        pass


class ConsoleObserver:
    def __init__(self):
        self.console = Console()

    def update(self, message: str) -> None:
        self.console.print(f"[blue]EVENT:[/blue] {message}")


class ConfigurationManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.initialize()
        return cls._instance

    def initialize(self):
        self.min_password_length = 8
        self.max_posts = 5
        self.available_roles = ["founder", "investor", "enthusiast"]
        self.encryption_key_path = Path("encryption.key")


class Command(ABC):
    @abstractmethod
    def execute(self) -> Any:
        pass


class GenerateUserCommand(Command):
    def __init__(self, generator: "UserGenerator"):
        self.generator = generator

    def execute(self) -> "User":
        return self.generator.generate_single_user()


class GenerateMultipleUsersCommand(Command):
    def __init__(self, generator: "UserGenerator", count: int):
        self.generator = generator
        self.count = count

    def execute(self) -> List["User"]:
        return self.generator.generate_users(self.count)


class UserRole(ABC):
    @abstractmethod
    def get_permissions(self) -> List[str]:
        pass


class FounderRole(UserRole):
    def get_permissions(self) -> List[str]:
        return ["create_company", "manage_team", "raise_funding"]


class InvestorRole(UserRole):
    def get_permissions(self) -> List[str]:
        return ["view_startups", "make_investments", "portfolio_management"]


class UserBuilder:
    def __init__(self):
        self.reset()

    def reset(self):
        self._user = {}

    def set_basic_info(self, name: str, email: str) -> "UserBuilder":
        self._user["name"] = name
        self._user["email"] = email
        return self

    def set_security(
        self, google_id: Optional[str], password: Optional[str]
    ) -> "UserBuilder":
        self._user["google_id"] = google_id
        self._user["password"] = password
        return self

    def set_role(self, role: str) -> "UserBuilder":
        self._user["role"] = role
        self._user["permissions"] = (
            FounderRole().get_permissions()
            if role == "founder"
            else InvestorRole().get_permissions()
        )
        return self

    def set_social(
        self, posts: List[str], following: List[str], followers: List[str]
    ) -> "UserBuilder":
        self._user["posts"] = posts
        self._user["following"] = following
        self._user["followers"] = followers
        return self

    def build(self) -> "User":
        user = User(**self._user)
        self.reset()
        return user


class UserDecorator(ABC):
    def __init__(self, user: "User"):
        self._user = user

    def __getattr__(self, name):
        return getattr(self._user, name)

    @property
    def user(self) -> "User":
        return self._user


class VerifiedUserDecorator(UserDecorator):
    @property
    def is_verified(self) -> bool:
        return True

    def get_badge(self) -> str:
        return "✓"

    @property
    def name(self) -> str:
        return f"{self._user.name} {self.get_badge()}"


@dataclass(frozen=True)
class EmailAddress:
    value: str

    def __post_init__(self):
        if not "@" in self.value:
            raise ValueError("Invalid email address")


@dataclass
class User:
    google_id: Optional[str]
    name: str
    email: str
    password: Optional[str]
    role: str
    permissions: List[str]
    posts: List[str]
    following: List[str]
    followers: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "googleId": self.google_id,
            "name": self.name,
            "email": self.email,
            "password": self.password,
            "role": self.role,
            "permissions": self.permissions,
            "posts": self.posts,
            "following": self.following,
            "followers": self.followers,
        }


class UserDataGeneratorFactory(ABC):
    @abstractmethod
    def create_id(self) -> Optional[str]:
        pass

    @abstractmethod
    def create_password(self) -> Optional[str]:
        pass

    @abstractmethod
    def create_role(self) -> str:
        pass


class FakeUserDataGenerator(UserDataGeneratorFactory):
    def __init__(self):
        self.faker = Faker()
        self.config = ConfigurationManager()

    def create_id(self) -> Optional[str]:
        return self.faker.uuid4() if random.choice([True, False]) else None

    def create_password(self) -> Optional[str]:
        if not random.choice([True, False]):
            return None
        return self.faker.password(length=self.config.min_password_length)

    def create_role(self) -> str:
        return random.choice(self.config.available_roles)


class PasswordStrategy(ABC):
    @abstractmethod
    def process_password(self, password: str) -> str:
        pass

    @abstractmethod
    def can_decrypt(self) -> bool:
        pass

    @abstractmethod
    def decrypt_password(self, encrypted_password: str) -> Optional[str]:
        pass


class FernetStrategy(PasswordStrategy):
    def __init__(self):
        self.config = ConfigurationManager()
        self.key = self._load_or_generate_key()
        self.fernet = Fernet(self.key)

    def _load_or_generate_key(self) -> bytes:
        if self.config.encryption_key_path.exists():
            return self.config.encryption_key_path.read_bytes()
        key = Fernet.generate_key()
        self.config.encryption_key_path.write_bytes(key)
        return key

    def process_password(self, password: str) -> str:
        encrypted = self.fernet.encrypt(password.encode())
        return base64.b64encode(encrypted).decode()

    def can_decrypt(self) -> bool:
        return True

    def decrypt_password(self, encrypted_password: str) -> str:
        encrypted_bytes = base64.b64decode(encrypted_password.encode())
        return self.fernet.decrypt(encrypted_bytes).decode()


class UserRepository:
    def __init__(self):
        self.users: List[User] = []

    def add(self, user: User) -> None:
        self.users.append(user)

    def add_many(self, users: List[User]) -> None:
        self.users.extend(users)

    def get_all(self) -> List[User]:
        return self.users.copy()

    def clear(self) -> None:
        self.users.clear()


class UserGenerator:
    def __init__(
        self,
        data_generator: UserDataGeneratorFactory,
        password_strategy: PasswordStrategy,
        user_repository: UserRepository,
    ):
        self.data_generator = data_generator
        self.password_strategy = password_strategy
        self.repository = user_repository
        self.faker = Faker()
        self.observers: List[UserGenerationObserver] = []
        self.builder = UserBuilder()

    def add_observer(self, observer: UserGenerationObserver) -> None:
        self.observers.append(observer)

    def notify_observers(self, message: str) -> None:
        for observer in self.observers:
            observer.update(message)

    def generate_single_user(self) -> User:
        raw_password = self.data_generator.create_password()
        processed_password = (
            self.password_strategy.process_password(raw_password)
            if raw_password
            else None
        )

        role = self.data_generator.create_role()
        permissions = (
            FounderRole().get_permissions()
            if role == "founder"
            else InvestorRole().get_permissions()
        )

        user = (
            self.builder.set_basic_info(
                name=self.faker.name(), email=self.faker.unique.email()
            )
            .set_security(
                google_id=self.data_generator.create_id(), password=processed_password
            )
            .set_role(role)
            .set_social(
                posts=[self.faker.uuid4() for _ in range(random.randint(0, 5))],
                following=[self.faker.uuid4() for _ in range(random.randint(0, 5))],
                followers=[self.faker.uuid4() for _ in range(random.randint(0, 5))],
            )
            .build()
        )

        self.notify_observers(f"Generated new user: {user.email}")
        return user

    def generate_users(self, count: int) -> List[User]:
        users = [self.generate_single_user() for _ in range(count)]
        self.repository.add_many(users)
        self.notify_observers(f"Generated {count} users")
        return users


class ConsoleDisplay:
    def __init__(self):
        self.console = Console()

    def display_users(self, users: List[User], password_strategy: PasswordStrategy):
        table = Table(title="Generated Users")

        table.add_column("Name", style="cyan")
        table.add_column("Email", style="green")
        table.add_column("Role", style="magenta")
        table.add_column("Permissions", style="blue")
        table.add_column("Password", style="red")
        table.add_column("Decrypted Password", style="yellow")
        table.add_column("Social Stats", style="white")

        for user in users:
            decrypted_password = "N/A"
            if user.password and password_strategy.can_decrypt():
                try:
                    decrypted_password = password_strategy.decrypt_password(
                        user.password
                    )
                except Exception as e:
                    decrypted_password = f"Error: {str(e)}"

            if random.choice([True, False]):
                user = VerifiedUserDecorator(user)

            table.add_row(
                user.name,
                user.email,
                user.role,
                ", ".join(user.permissions),
                str(user.password),
                decrypted_password,
                f"👥 {len(user.followers)} | ✍️ {len(user.posts)}",
            )

        self.console.print(table)
        self.console.print("\nDetailed User Data:", style="bold underline")
        for user in users:
            if isinstance(user, UserDecorator):
                user = user.user
            self.console.print(json.dumps(user.to_dict(), indent=2), style="dim")


def main():
    config = ConfigurationManager()
    data_generator = FakeUserDataGenerator()
    password_strategy = FernetStrategy()
    user_repository = UserRepository()
    user_generator = UserGenerator(data_generator, password_strategy, user_repository)
    display_service = ConsoleDisplay()

    console_observer = ConsoleObserver()
    user_generator.add_observer(console_observer)

    try:
        num_users = int(input("Enter the number of fake users to generate: "))
        if num_users < 1:
            raise ValueError("Number of users must be positive")
    except ValueError as e:
        print(f"Invalid input: {e}")
        return
    command = GenerateMultipleUsersCommand(user_generator, num_users)
    users = command.execute()
    display_service.display_users(users, password_strategy)


if __name__ == "__main__":
    main()
