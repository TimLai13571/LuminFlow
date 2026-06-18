"""
LuminFlow narration TTS generator.

Generates English narration audio (mp3) for every segment defined in the
Remotion narration script. Outputs are written to:

    public/audio/narration/{segment_id}.mp3

Supported providers (selected via --provider or NARRATION_TTS_PROVIDER):
    - minimax-tts   (default)
    - elevenlabs
    - kling-tts
    - volcengine    (火山引擎 / Ark TTS - uses ARK_API_KEY)

Examples:
    # Print scripts only, no audio generation
    python server/scripts/generate_narration_audio.py --dry-run

    # Generate with ElevenLabs
    python server/scripts/generate_narration_audio.py \\
        --provider elevenlabs --voice Rachel

    # Force regenerate (overwrite existing files)
    python server/scripts/generate_narration_audio.py --force
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Callable, Dict, List, Optional

# ---------------------------------------------------------------------------
# Optional dependencies (loaded lazily so --dry-run works without installs).
# ---------------------------------------------------------------------------
try:
    import httpx  # type: ignore
except ImportError:  # pragma: no cover
    httpx = None  # type: ignore

try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:  # pragma: no cover
    load_dotenv = None  # type: ignore


# ---------------------------------------------------------------------------
# Path resolution
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
SERVER_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = SERVER_DIR.parent
PUBLIC_DIR = PROJECT_ROOT / "public"
OUTPUT_DIR = PUBLIC_DIR / "audio" / "narration"


# ---------------------------------------------------------------------------
# Narration script (mirrors src/remotion/narration/script.ts).
# Keep in sync if the TS script changes.
# ---------------------------------------------------------------------------
@dataclass
class NarrationSegment:
    id: str
    start_seconds: float
    end_seconds: float
    module: str
    text: str

    @property
    def duration_seconds(self) -> float:
        return self.end_seconds - self.start_seconds


NARRATION_SCRIPT: List[NarrationSegment] = [
    NarrationSegment(
        id="brand-intro",
        start_seconds=0,
        end_seconds=6,
        module="Brand Opening",
        text=(
            "Welcome to LuminFlow. An AI-powered audit transparency platform "
            "built on the COSO 2013 framework."
        ),
    ),
    NarrationSegment(
        id="dashboard",
        start_seconds=6,
        end_seconds=25,
        module="Dashboard",
        text=(
            "The Dashboard delivers real-time visibility into audit progress and "
            "control coverage. Track PBC completion and aggregated risk scores "
            "across the engagement. Role-based views adapt instantly for Auditors, "
            "Partners, and CFOs. A live heatmap, audit stepper, and activity "
            "timeline keep every stakeholder aligned around current execution status."
        ),
    ),
    NarrationSegment(
        id="tracemap-objectives",
        start_seconds=25,
        end_seconds=43,
        module="TraceMap / Objectives",
        text=(
            "TraceMap visualizes the COSO 2013 three-level objective hierarchy as "
            "an interactive audit tree connecting objectives, risks, and controls. "
            "AI Insight decomposes strategic goals into testable, traceable "
            "controls, while a radar chart benchmarks coverage across multiple "
            "audit dimensions."
        ),
    ),
    NarrationSegment(
        id="heatlens",
        start_seconds=43,
        end_seconds=58,
        module="HeatLens",
        text=(
            "HeatLens unifies the full risk landscape with the Risk Control Matrix. "
            "Tune weights for inherent risk and control effectiveness in real time. "
            "Multi-factor scoring captures the true residual exposure that no "
            "single metric can."
        ),
    ),
    NarrationSegment(
        id="samplelens",
        start_seconds=58,
        end_seconds=76,
        module="SampleLens",
        text=(
            "SampleLens recommends optimal sample sizes through AI-driven analysis, "
            "supporting monetary unit and attribute sampling methodologies. Tune "
            "confidence, tolerable, and expected deviation rates with full "
            "transparency. Event-driven reinforcement automatically expands samples "
            "when control risk rises."
        ),
    ),
    NarrationSegment(
        id="pbcview",
        start_seconds=76,
        end_seconds=93,
        module="PBCView",
        text=(
            "PBCView centralizes Provided-By-Client document management end to end. "
            "AI auto-generates tailored PBC lists by industry and audit process. "
            "Overdue alerts and reminder emails accelerate every client response, "
            "while progress tracked by control area streamlines the auditor-client "
            "exchange."
        ),
    ),
    NarrationSegment(
        id="narrativelens",
        start_seconds=93,
        end_seconds=110,
        module="NarrativeLens",
        text=(
            "NarrativeLens turns raw findings into structured audit narratives via "
            "generative AI. Key points are extracted automatically and prepared "
            "for review. A three-step flow routes drafts through Submit, Manager "
            "Review, and Partner Sign-off, so human-AI collaboration safeguards "
            "every narrative's audit quality."
        ),
    ),
    NarrationSegment(
        id="impact-simulator",
        start_seconds=110,
        end_seconds=128,
        module="ImpactSimulator",
        text=(
            "ImpactSimulator models the outcome of any control deficiency. A "
            "force-directed graph traces how risk propagates through connected "
            "control nodes. Quantify potential financial loss and regulatory "
            "penalty exposure, while AI ranks remediation priority by projected "
            "business impact."
        ),
    ),
    NarrationSegment(
        id="team-ai",
        start_seconds=128,
        end_seconds=148,
        module="TeamPanel + AI",
        text=(
            "TeamPanel governs a multi-role permission matrix for the engagement. "
            "From Audit Manager to Client Liaison, visibility is scoped per module "
            "and dataset. The AI assistant answers natural-language audit queries "
            "instantly - analyze risks, generate sampling plans, or explain COSO "
            "principles on demand. API data integrations are managed from one "
            "unified console."
        ),
    ),
    NarrationSegment(
        id="integration",
        start_seconds=148,
        end_seconds=162,
        module="Platform Integration",
        text=(
            "Every module connects into one continuous, end-to-end workflow. Data "
            "flows across planning, execution, and assessment without friction. "
            "RESTful APIs open LuminFlow to ERP, GRC, and external audit systems."
        ),
    ),
    NarrationSegment(
        id="closing",
        start_seconds=162,
        end_seconds=180,
        module="Closing",
        text=(
            "From planning to sign-off, LuminFlow unifies every audit signal. "
            "Faster cycles, sharper insight, and defensible evidence at every step. "
            "Audit transparency, redefined. Step into LuminFlow and discover "
            "intelligent assurance in action."
        ),
    ),
]


# ---------------------------------------------------------------------------
# Provider configuration
# ---------------------------------------------------------------------------
PROVIDERS = ("minimax-tts", "elevenlabs", "kling-tts", "volcengine")


@dataclass
class TtsConfig:
    provider: str
    voice: str
    api_key: str
    model: Optional[str] = None
    endpoint: Optional[str] = None
    speed: float = 1.0
    timeout: float = 60.0
    max_retries: int = 3
    retry_backoff: float = 2.0


def _require_httpx() -> None:
    if httpx is None:
        raise RuntimeError(
            "httpx is required for TTS HTTP calls. "
            "Install via: pip install httpx python-dotenv"
        )


# Each provider implementation accepts (text, cfg) and returns mp3 bytes.
ProviderFn = Callable[[str, TtsConfig], bytes]


def _provider_minimax(text: str, cfg: TtsConfig) -> bytes:
    """MiniMax TTS HTTP API - returns mp3 bytes."""
    _require_httpx()
    endpoint = cfg.endpoint or "https://api.minimax.chat/v1/t2a_v2"
    payload = {
        "model": cfg.model or "speech-01-turbo",
        "text": text,
        "stream": False,
        "voice_setting": {
            "voice_id": cfg.voice or "English_radiant_girl",
            "speed": cfg.speed,
            "vol": 1.0,
            "pitch": 0,
        },
        "audio_setting": {
            "sample_rate": 32000,
            "bitrate": 128000,
            "format": "mp3",
            "channel": 1,
        },
    }
    headers = {
        "Authorization": f"Bearer {cfg.api_key}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=cfg.timeout) as client:  # type: ignore
        resp = client.post(endpoint, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
    # MiniMax returns hex-encoded audio in data.audio
    audio_hex = (data.get("data") or {}).get("audio")
    if not audio_hex:
        raise RuntimeError(f"MiniMax response missing audio: {data}")
    return bytes.fromhex(audio_hex)


def _provider_elevenlabs(text: str, cfg: TtsConfig) -> bytes:
    """ElevenLabs TTS - voice is a voice id."""
    _require_httpx()
    voice_id = cfg.voice or "21m00Tcm4TlvDq8ikWAM"  # default Rachel
    endpoint = (
        cfg.endpoint
        or f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    )
    payload = {
        "text": text,
        "model_id": cfg.model or "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }
    headers = {
        "xi-api-key": cfg.api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }
    with httpx.Client(timeout=cfg.timeout) as client:  # type: ignore
        resp = client.post(endpoint, headers=headers, json=payload)
        resp.raise_for_status()
        return resp.content


def _provider_kling(text: str, cfg: TtsConfig) -> bytes:
    """Kling TTS - placeholder schema; adapt to the live spec when available."""
    _require_httpx()
    endpoint = cfg.endpoint or "https://api.klingai.com/v1/tts/generate"
    payload = {
        "text": text,
        "voice": cfg.voice or "en_us_male_01",
        "model": cfg.model or "kling-tts-v1",
        "speed": cfg.speed,
        "format": "mp3",
    }
    headers = {
        "Authorization": f"Bearer {cfg.api_key}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=cfg.timeout) as client:  # type: ignore
        resp = client.post(endpoint, headers=headers, json=payload)
        resp.raise_for_status()
        ctype = resp.headers.get("content-type", "")
        if ctype.startswith("audio/"):
            return resp.content
        data = resp.json()
        audio_b64 = (data.get("data") or {}).get("audio")
        if not audio_b64:
            raise RuntimeError(f"Kling response missing audio: {data}")
        import base64

        return base64.b64decode(audio_b64)


def _provider_volcengine(text: str, cfg: TtsConfig) -> bytes:
    """Volcengine (Ark) TTS - uses ARK_API_KEY."""
    _require_httpx()
    endpoint = (
        cfg.endpoint
        or "https://openspeech.bytedance.com/api/v1/tts"
    )
    payload = {
        "app": {"appid": os.getenv("ARK_APP_ID", ""), "cluster": "volcano_tts"},
        "user": {"uid": "luminflow"},
        "audio": {
            "voice_type": cfg.voice or "BV701_streaming",
            "encoding": "mp3",
            "speed_ratio": cfg.speed,
        },
        "request": {
            "reqid": f"luminflow-{int(time.time() * 1000)}",
            "text": text,
            "operation": "query",
        },
    }
    headers = {
        "Authorization": f"Bearer;{cfg.api_key}",
        "Content-Type": "application/json",
    }
    with httpx.Client(timeout=cfg.timeout) as client:  # type: ignore
        resp = client.post(endpoint, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
    audio_b64 = data.get("data")
    if not audio_b64:
        raise RuntimeError(f"Volcengine response missing audio: {data}")
    import base64

    return base64.b64decode(audio_b64)


PROVIDER_FNS: Dict[str, ProviderFn] = {
    "minimax-tts": _provider_minimax,
    "elevenlabs": _provider_elevenlabs,
    "kling-tts": _provider_kling,
    "volcengine": _provider_volcengine,
}


# ---------------------------------------------------------------------------
# Core driver
# ---------------------------------------------------------------------------
def _resolve_api_key(provider: str) -> str:
    """Resolve API key from common env var names per provider."""
    candidates: List[str] = []
    if provider == "minimax-tts":
        candidates = ["MINIMAX_API_KEY", "MINIMAX_GROUP_TOKEN"]
    elif provider == "elevenlabs":
        candidates = ["ELEVENLABS_API_KEY", "ELEVEN_API_KEY"]
    elif provider == "kling-tts":
        candidates = ["KLING_API_KEY"]
    elif provider == "volcengine":
        candidates = ["ARK_API_KEY", "VOLCENGINE_TTS_TOKEN"]
    for name in candidates:
        val = os.getenv(name)
        if val:
            return val
    raise RuntimeError(
        f"Missing API key for provider '{provider}'. "
        f"Set one of: {', '.join(candidates)}"
    )


def _generate_with_retries(
    fn: ProviderFn, text: str, cfg: TtsConfig, segment_id: str
) -> bytes:
    last_err: Optional[Exception] = None
    for attempt in range(1, cfg.max_retries + 1):
        try:
            return fn(text, cfg)
        except Exception as exc:  # noqa: BLE001 - bubble to retry/backoff
            last_err = exc
            wait = cfg.retry_backoff ** (attempt - 1)
            print(
                f"  [retry {attempt}/{cfg.max_retries}] {segment_id}: "
                f"{exc} - waiting {wait:.1f}s",
                file=sys.stderr,
            )
            time.sleep(wait)
    raise RuntimeError(
        f"TTS generation failed for segment '{segment_id}' "
        f"after {cfg.max_retries} attempts: {last_err}"
    )


def run(args: argparse.Namespace) -> int:
    if args.dry_run:
        _print_dry_run(args)
        return 0

    cfg = TtsConfig(
        provider=args.provider,
        voice=args.voice or "",
        api_key=_resolve_api_key(args.provider),
        model=args.model,
        endpoint=args.endpoint,
        speed=args.speed,
        timeout=args.timeout,
        max_retries=args.max_retries,
    )

    fn = PROVIDER_FNS[cfg.provider]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    targets = _filter_segments(args.only)
    print(
        f"Generating {len(targets)} segment(s) via '{cfg.provider}' "
        f"-> {OUTPUT_DIR}"
    )

    success = 0
    for seg in targets:
        out_path = OUTPUT_DIR / f"{seg.id}.mp3"
        if out_path.exists() and not args.force:
            print(f"  [skip] {seg.id} (already exists)")
            success += 1
            continue
        print(f"  [tts ] {seg.id} ({seg.duration_seconds:.1f}s)")
        try:
            audio = _generate_with_retries(fn, seg.text, cfg, seg.id)
        except Exception as exc:  # noqa: BLE001
            print(f"  [fail] {seg.id}: {exc}", file=sys.stderr)
            continue
        out_path.write_bytes(audio)
        success += 1

    total = len(targets)
    print(f"Done: {success}/{total} segment(s) written.")
    return 0 if success == total else 1


def _filter_segments(only: Optional[List[str]]) -> List[NarrationSegment]:
    if not only:
        return NARRATION_SCRIPT
    keep = set(only)
    filtered = [s for s in NARRATION_SCRIPT if s.id in keep]
    missing = keep.difference({s.id for s in filtered})
    if missing:
        raise SystemExit(f"Unknown segment id(s): {sorted(missing)}")
    return filtered


def _print_dry_run(args: argparse.Namespace) -> None:
    targets = _filter_segments(args.only)
    print(f"Dry-run: {len(targets)} segment(s), provider={args.provider}")
    print(f"Output dir: {OUTPUT_DIR}")
    print("-" * 72)
    for seg in targets:
        print(f"[{seg.id}] {seg.start_seconds:.0f}s -> {seg.end_seconds:.0f}s "
              f"({seg.module})")
        print(f"  text: {seg.text}")
        print()
    if args.json:
        payload = [asdict(s) for s in targets]
        print("--- JSON ---")
        print(json.dumps(payload, ensure_ascii=False, indent=2))


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Generate narration TTS audio for LuminFlow demo video.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument(
        "--provider",
        choices=PROVIDERS,
        default=os.getenv("NARRATION_TTS_PROVIDER", "minimax-tts"),
        help="TTS provider to use.",
    )
    p.add_argument(
        "--voice",
        default=os.getenv("NARRATION_TTS_VOICE"),
        help="Provider-specific voice id / name.",
    )
    p.add_argument(
        "--model",
        default=os.getenv("NARRATION_TTS_MODEL"),
        help="Provider-specific model name.",
    )
    p.add_argument(
        "--endpoint",
        default=os.getenv("NARRATION_TTS_ENDPOINT"),
        help="Override provider HTTP endpoint.",
    )
    p.add_argument(
        "--speed", type=float, default=1.0, help="Playback speed ratio."
    )
    p.add_argument(
        "--timeout",
        type=float,
        default=60.0,
        help="HTTP request timeout in seconds.",
    )
    p.add_argument(
        "--max-retries", type=int, default=3, help="Max retries per segment."
    )
    p.add_argument(
        "--only",
        nargs="*",
        help="Restrict to specific segment ids (space-separated).",
    )
    p.add_argument(
        "--force",
        action="store_true",
        help="Regenerate even if the output file already exists.",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print scripts only, do not call any TTS API.",
    )
    p.add_argument(
        "--json",
        action="store_true",
        help="In dry-run, also dump segments as JSON.",
    )
    return p


def main() -> None:
    # Load .env from server/ first, then project root, so ARK_API_KEY etc.
    # become available without exporting them manually.
    if load_dotenv is not None:
        for candidate in (SERVER_DIR / ".env", PROJECT_ROOT / ".env"):
            if candidate.exists():
                load_dotenv(candidate, override=False)
    parser = _build_parser()
    args = parser.parse_args()
    sys.exit(run(args))


if __name__ == "__main__":
    main()
