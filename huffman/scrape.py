import urllib.request
import numpy as np
import heapq
import json

PAGES = 1
EXTRACT_LEN = 500

# Calculate frequencies
def calc_freq():

    freq_arr = np.zeros(127 - 32)
    print(f"Downloading {PAGES} pages from Project Gutenberg...")
    for i in range(1, PAGES + 1):
        url = f"https://www.gutenberg.org/cache/epub/{i}/pg{i}.txt"

        try:
            with urllib.request.urlopen(url) as response:
                raw_text = response.read().decode("utf-8")
        except Exception as e:
            print(f"Error downloading text: {e}")
            return

        index_lo = max((len(raw_text) - EXTRACT_LEN) // 2, 0)
        index_hi = min((len(raw_text) + EXTRACT_LEN) // 2, len(raw_text))
        selected_text = raw_text[index_lo:index_hi]
        for ch in selected_text:
            if 32 <= ord(ch) < 127:
                freq_arr[ord(ch) - 32] += 1

    return freq_arr

# Huffman Encoding
class CharNode:
    def __init__(self, freq, val, left, right):
        self.freq = freq
        self.val = val
        self.left = left
        self.right = right

    def __lt__(self, other):
        return self.freq < other.freq

# Change gen_key to accept and append strings
def gen_key(node: CharNode, prefix: str, mapping):
    if not node: return
    if node.val is None:
        gen_key(node.left, prefix + "0", mapping)
        gen_key(node.right, prefix + "1", mapping)
    else:
        print(f"Char: {repr(node.val)}, Code: {prefix}")
        mapping[node.val] = prefix  # Note: usually Huffman maps Char -> Code, 
                                    # or if you want Code -> Char, use mapping[prefix] = node.val

def gen_huffman_dict() -> dict:
    freq_arr = calc_freq()

    pq = [CharNode(freq, chr(index + 32), None, None) for index, freq in enumerate(freq_arr)]
    heapq.heapify(pq)

    while len(pq) > 1:
        node1 = heapq.heappop(pq)
        node2 = heapq.heappop(pq)
        heapq.heappush(pq, CharNode(node1.freq + node2.freq, None, node1, node2))

    root = heapq.heappop(pq)

    mapping = {}
    gen_key(root, "", mapping) # Pass an empty string as the starting prefix
    return mapping

if __name__ == "__main__":
    huffman_mapping = gen_huffman_dict()
    with open('huffman_mapping.json', 'w') as f:
        f.write(json.dumps(huffman_mapping, indent=4))