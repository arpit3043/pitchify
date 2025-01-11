from abc import ABC, abstractmethod
from typing import List

# Base Profile class
class UserProfile(ABC):
    def __init__(self, id: int, name: str, interests: List[str], location: str):
        self.id = id
        self.name = name
        self.interests = interests
        self.location = location
    
    @abstractmethod
    def get_profile_data(self):
        pass

# Founder and Investor classes
class FounderProfile(UserProfile):
    def __init__(self, id, name, interests, location, startup_stage, funding_needed):
        super().__init__(id, name, interests, location)
        self.startup_stage = startup_stage
        self.funding_needed = funding_needed

    def get_profile_data(self):
        return {
            "id": self.id,
            "name": self.name,
            "interests": self.interests,
            "location": self.location,
            "startup_stage": self.startup_stage,
            "funding_needed": self.funding_needed,
        }

class InvestorProfile(UserProfile):
    def __init__(self, id, name, interests, location, investment_stage, max_investment):
        super().__init__(id, name, interests, location)
        self.investment_stage = investment_stage
        self.max_investment = max_investment

    def get_profile_data(self):
        return {
            "id": self.id,
            "name": self.name,
            "interests": self.interests,
            "location": self.location,
            "investment_stage": self.investment_stage,
            "max_investment": self.max_investment,
        }
