from services.UserProfile import UserProfile
from typing import List
from services.MatchingStratergy import MatchingStrategy

class MatchingSystem:
    def __init__(self, matching_strategy: MatchingStrategy):
        self.matching_strategy = matching_strategy

    def match(self, user_profile: UserProfile, candidates: List[UserProfile]):
        return self.matching_strategy.find_matches(user_profile, candidates)
