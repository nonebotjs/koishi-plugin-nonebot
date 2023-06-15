from .params import Dependent


class Rule:
  def __init__(self, *checkers) -> None:
    self.checkers = checkers
