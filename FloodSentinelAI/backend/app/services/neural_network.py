import math


class LightweightFloodNetwork:
    """Small deterministic neural-style scorer for prototype inference."""

    def __init__(self) -> None:
        self.hidden_weights = (
            (1.8, 0.7, 1.2),
            (0.9, 1.6, -0.4),
            (1.2, -0.2, 1.4),
        )
        self.output_weights = (0.42, 0.31, 0.27)

    @staticmethod
    def _sigmoid(value: float) -> float:
        return 1 / (1 + math.exp(-value))

    def score(self, water_ratio: float, texture_signal: float, blue_dominance: float) -> float:
        features = (water_ratio, texture_signal, blue_dominance)
        hidden = []
        for node in self.hidden_weights:
            activation = sum(weight * feature for weight, feature in zip(node, features))
            hidden.append(self._sigmoid(activation))
        return min(1.0, max(0.0, sum(weight * value for weight, value in zip(self.output_weights, hidden))))

