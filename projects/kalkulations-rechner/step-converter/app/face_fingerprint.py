from __future__ import annotations

from OCC.Core.Quantity import Quantity_Color, Quantity_TOC_RGB

_MAX_FINGERPRINT_INDEX = 4096
_DECODE_TOLERANCE = 8


def encode_fingerprint_index(index: int) -> Quantity_Color:
    value = index + 1
    red = max(1, (37 * value) % 256) / 255.0
    green = max(1, (89 * value) % 256) / 255.0
    blue = max(1, (197 * value) % 256) / 255.0
    return Quantity_Color(red, green, blue, Quantity_TOC_RGB)


def _fingerprint_distance(
    red: float,
    green: float,
    blue: float,
    index: int,
) -> int:
    expected = encode_fingerprint_index(index)
    red_delta = abs(round(red * 255) - round(expected.Red() * 255))
    green_delta = abs(round(green * 255) - round(expected.Green() * 255))
    blue_delta = abs(round(blue * 255) - round(expected.Blue() * 255))
    return red_delta + green_delta + blue_delta


def decode_fingerprint_rgb(red: float, green: float, blue: float) -> int | None:
    red_channel = round(red * 255)
    green_channel = round(green * 255)
    blue_channel = round(blue * 255)
    if red_channel == 0 and green_channel == 0 and blue_channel == 0:
        return None

    best_index: int | None = None
    best_distance = _DECODE_TOLERANCE + 1
    for index in range(_MAX_FINGERPRINT_INDEX):
        distance = _fingerprint_distance(red, green, blue, index)
        if distance < best_distance:
            best_distance = distance
            best_index = index
        if distance == 0:
            return index

    if best_index is not None and best_distance <= _DECODE_TOLERANCE:
        return best_index

    return None
