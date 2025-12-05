"""Test library for OpenDocs Python extractor."""

from typing import Optional, Union, Literal
from enum import IntEnum


class Calculator:
    """A simple calculator class for testing."""

    PI: float = 3.14159
    """Mathematical constant PI"""

    def __init__(self, precision: int = 2):
        """
        Initialize the calculator.

        Args:
            precision: Number of decimal places for results
        """
        self.precision = precision

    def add(self, a: float, b: float) -> float:
        """
        Add two numbers together.

        Args:
            a: First number
            b: Second number

        Returns:
            The sum of a and b
        """
        return round(a + b, self.precision)

    def subtract(self, a: float, b: float) -> float:
        """
        Subtract b from a.

        Args:
            a: Number to subtract from
            b: Number to subtract

        Returns:
            The difference
        """
        return round(a - b, self.precision)

    @staticmethod
    def multiply(a: float, b: float) -> float:
        """
        Multiply two numbers.

        Args:
            a: First number
            b: Second number

        Returns:
            The product
        """
        return a * b


class Config:
    """Configuration options for the library."""

    def __init__(
        self,
        debug: bool,
        timeout: int,
        max_retries: Optional[int] = None
    ):
        """
        Initialize configuration.

        Args:
            debug: Enable debug mode
            timeout: Timeout in milliseconds
            max_retries: Maximum number of retries (optional)
        """
        self.debug = debug
        self.timeout = timeout
        self.max_retries = max_retries


class LogLevel(IntEnum):
    """Log levels enumeration."""

    DEBUG = 0
    """Debug level logging"""

    INFO = 1
    """Info level logging"""

    WARN = 2
    """Warning level logging"""

    ERROR = 3
    """Error level logging"""


# Type alias for Result
Result = Union[
    dict[Literal["success"], Literal[True]] | dict[Literal["data"], object],
    dict[Literal["success"], Literal[False]] | dict[Literal["error"], str]
]


def greet(name: str) -> str:
    """
    Greet a user by name.

    Args:
        name: Name of the person to greet

    Returns:
        A greeting message
    """
    return f"Hello, {name}!"


def format_currency(amount: float, currency: str = "USD") -> str:
    """
    Format a number as currency.

    Args:
        amount: The amount to format
        currency: Currency code (default: USD)

    Returns:
        Formatted currency string
    """
    return f"{currency} {amount:.2f}"
