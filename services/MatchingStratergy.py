from services.UserProfile import UserProfile
from typing import List
from abc import ABC, abstractmethod

class MatchingStrategy(ABC):
    @abstractmethod
    def find_matches(self, profile: UserProfile, candidates: List[UserProfile]):
        pass

class ContentBasedMatching(MatchingStrategy):
    def find_matches(self, profile: UserProfile, candidates: List[UserProfile]):
        matches = []
        for candidate in candidates:
            match_score = self.calculate_match_score(profile, candidate)
            if match_score > 0.5:
                matches.append((candidate, match_score))
        return sorted(matches, key=lambda x: x[1], reverse=True)

    def calculate_match_score(self, profile: UserProfile, candidate: UserProfile):
        return 0.7 if set(profile.interests).intersection(candidate.interests) else 0.3
