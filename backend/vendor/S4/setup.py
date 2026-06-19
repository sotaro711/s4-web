"""自己完結型ビルド。

元の S4 は `make build/libS4.a` で静的ライブラリを作ってから setup.py で
リンクする2段階だったが、ここでは全ソースを setup.py で直接コンパイルし、
`pip`/`uv` だけでビルドできるようにしている（事前の make 不要）。
Lua フロントエンド（main_lua.c / ext_lua.c）は含めない。
"""

import sys

from setuptools import Extension, setup

LIB_SOURCES = [
    "S4/S4.cpp",
    "S4/rcwa.cpp",
    "S4/fmm/fft_iface.cpp",
    "S4/fmm/fmm_closed.cpp",
    "S4/fmm/fmm_common.cpp",
    "S4/fmm/fmm_experimental.cpp",
    "S4/fmm/fmm_FFT.cpp",
    "S4/fmm/fmm_kottke.cpp",
    "S4/fmm/fmm_PolBasisJones.cpp",
    "S4/fmm/fmm_PolBasisNV.cpp",
    "S4/fmm/fmm_PolBasisVL.cpp",
    "S4/pattern/intersection.c",
    "S4/pattern/pattern.c",
    "S4/pattern/predicates.c",
    "S4/numalloc.c",
    "S4/gsel.c",
    "S4/sort.c",
    "S4/SpectrumSampler.c",
    "S4/cubature.c",
    "S4/Interpolator.c",
    "S4/convert.c",
    "S4/kiss_fft/kiss_fft.c",
    "S4/kiss_fft/tools/kiss_fftnd.c",
    "S4/RNP/Eigensystems.cpp",
]

# 線形代数バックエンド。macOS は Accelerate、それ以外は OpenBLAS/LAPACK を想定。
if sys.platform == "darwin":
    libraries = ["c++"]
    extra_link_args = ["-framework", "Accelerate"]
else:
    libraries = ["stdc++", "openblas"]
    extra_link_args = []

S4module = Extension(
    "S4",
    sources=["S4/main_python.c", *LIB_SOURCES],
    include_dirs=["S4", "S4/RNP", "S4/kiss_fft"],
    libraries=libraries,
    extra_link_args=extra_link_args,
)

setup(
    name="S4",
    version="1.1",
    description="Stanford Stratified Structure Solver (S4): Fourier Modal Method",
    ext_modules=[S4module],
)
