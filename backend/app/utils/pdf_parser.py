import pdfplumber
import re
import logging
from typing import List, Dict

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_mcq_pdf(file_path: str) -> List[Dict]:
    questions = []
    logger.info(f"Hardenened Parsing Start: {file_path}")
    
    try:
        with pdfplumber.open(file_path) as pdf:
            raw_text_lines = []
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    # Clean horizontal artifacts like "Page 1"
                    lines = page_text.split('\n')
                    for line in lines:
                        line = line.strip()
                        # Skip standalone page numbers or "Page X"
                        if not line or re.match(r'^\d+$', line) or re.match(r'^Page\s+\d+', line, re.IGNORECASE):
                            continue
                        raw_text_lines.append(line)
            
            # Combine all lines into one large block with single spaces
            # This handles line wrapping across pages and lines
            full_text = " ".join(raw_text_lines)
            
            # Flatten whitespace
            full_text = re.sub(r'\s+', ' ', full_text)
            
            # 1. Identify Question Blocks
            # A question starts with something like "1.", "Q1.", "1)", etc.
            # We use a lookahead to find the next question marker
            # Regex Explanation: Find [Marker] [Text] [Options] [Answer]
            # [Marker]: (Q?\d+) followed by [. or )]
            # [Options]: Starts with A, B, C, D (optionally in brackets)
            # [Answer]: Keyword like Answer/Ans followed by A-D
            
            # We wrap the text in markers to help the regex find the start of the first question
            # and the end of the last one.
            
            # Pattern for a single question block including options and answer
            # We use non-greedy matching (.*?) to ensure we don't skip over questions
            q_pattern = re.compile(
                r"(?P<marker>Q?\d+)\s*[\.\)]\s+"                # Question number + separator
                r"(?P<text>.*?)\s*"                            # Question text
                r"[\(\[]?A[\)\]\.\s]\s*(?P<opt_a>.*?)\s*"      # Option A
                r"[\(\[]?B[\)\]\.\s]\s*(?P<opt_b>.*?)\s*"      # Option B
                r"[\(\[]?C[\)\]\.\s]\s*(?P<opt_c>.*?)\s*"      # Option C
                r"[\(\[]?D[\)\]\.\s]\s*(?P<opt_d>.*?)\s*"      # Option D
                r"(?:Answer|Ans|Correct Option):?\s*(?P<ans>[A-D])", # Answer key
                re.IGNORECASE | re.DOTALL
            )
            
            # Find all chunks that look like a question block
            matches = list(q_pattern.finditer(full_text))
            
            for match in matches:
                data = match.groupdict()
                
                # Check for empty fields
                if not data['text'].strip() or not data['opt_a'].strip():
                    logger.warning(f"Detection warning: Skipping likely false positive at Q{data['marker']}")
                    continue
                
                questions.append({
                    "question_text": data['text'].strip(),
                    "option_a": data['opt_a'].strip(),
                    "option_b": data['opt_b'].strip(),
                    "option_c": data['opt_c'].strip(),
                    "option_d": data['opt_d'].strip(),
                    "correct_option": data['ans'].upper(),
                    "marks": 1.0
                })
                logger.info(f"Verified & Parsed: Q{data['marker']} - {data['text'][:40]}...")

            # 2. Fallback / Diagnostic Logic
            # If we didn't find as many questions as markers, log which ones were missed
            marker_count = len(re.findall(r'Q?\d+[\.\)]\s+', full_text))
            if len(questions) < marker_count:
                logger.error(f"Integrity Gap: Found {marker_count} markers but only parsed {len(questions)} full MCQ blocks.")
                logger.info("This usually happens if 'Answer:' tags are missing or options aren't labeled A-D.")
            
        logger.info(f"Final Extraction Success: Total {len(questions)} questions extracted.")

    except Exception as e:
        logger.error(f"Senior Engineer Diagnostic: PDF Logic Failure - {str(e)}")
        raise e

    return questions
