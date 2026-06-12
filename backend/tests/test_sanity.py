"""scaffold の健全性チェック。パッケージが import 可能であること。"""


def test_package_importable():
    import s4web  # noqa: F401


def test_s4_importable_if_installed():
    """S4 拡張が入っている環境なら import できる（CI では skip）。"""
    import pytest

    S4 = pytest.importorskip("S4")
    assert hasattr(S4, "New")
