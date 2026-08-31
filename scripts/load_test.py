"""
Resora Load Balancer Stress & Concurrency Test Script
Simulates concurrent user requests against the Load Balancer / API Gateway
to verify throughput, latency, and fault tolerance for 1,000+ users.
"""

import time
import concurrent.futures
import urllib.request
import urllib.error
import json
import sys

TARGET_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost/lb-health"
CONCURRENT_USERS = int(sys.argv[2]) if len(sys.argv) > 2 else 50
TOTAL_REQUESTS = int(sys.argv[3]) if len(sys.argv) > 3 else 200

def send_request(req_id: int):
    start = time.time()
    try:
        req = urllib.request.Request(
            TARGET_URL,
            headers={"User-Agent": f"Resora-LoadTester/1.0 (User-{req_id % CONCURRENT_USERS})"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            status_code = response.getcode()
            data = response.read().decode("utf-8")
            latency = (time.time() - start) * 1000
            return {
                "id": req_id,
                "status": status_code,
                "latency_ms": latency,
                "success": status_code == 200,
                "error": None,
                "body": data[:80]
            }
    except urllib.error.HTTPError as e:
        latency = (time.time() - start) * 1000
        return {"id": req_id, "status": e.code, "latency_ms": latency, "success": False, "error": f"HTTP {e.code}"}
    except Exception as e:
        latency = (time.time() - start) * 1000
        return {"id": req_id, "status": 0, "latency_ms": latency, "success": False, "error": str(e)}

def run_load_test():
    print(f"\n=======================================================")
    print(f"🚀 RESORA LOAD BALANCER STRESS TEST")
    print(f"   Target URL:        {TARGET_URL}")
    print(f"   Simulated Users:   {CONCURRENT_USERS} concurrent workers")
    print(f"   Total Requests:    {TOTAL_REQUESTS}")
    print(f"=======================================================\n")

    start_all = time.time()
    results = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENT_USERS) as executor:
        futures = [executor.submit(send_request, i) for i in range(TOTAL_REQUESTS)]
        for f in concurrent.futures.as_completed(futures):
            results.append(f.result())

    total_time = time.time() - start_all
    successes = [r for r in results if r["success"]]
    failures = [r for r in results if not r["success"]]
    latencies = [r["latency_ms"] for r in results]

    avg_latency = sum(latencies) / len(latencies) if latencies else 0
    min_latency = min(latencies) if latencies else 0
    max_latency = max(latencies) if latencies else 0
    sorted_lat = sorted(latencies)
    p95_latency = sorted_lat[int(len(sorted_lat) * 0.95)] if sorted_lat else 0
    p99_latency = sorted_lat[int(len(sorted_lat) * 0.99)] if sorted_lat else 0
    rps = len(results) / total_time if total_time > 0 else 0

    print("📊 TEST RESULTS SUMMARY:")
    print(f"   Total Time Elapsed:    {total_time:.2f}s")
    print(f"   Requests Completed:    {len(results)}/{TOTAL_REQUESTS}")
    print(f"   Success Rate:          {(len(successes) / len(results)) * 100:.1f}% ({len(successes)} passed, {len(failures)} failed)")
    print(f"   Throughput (RPS):      {rps:.1f} req/sec")
    print(f"   Min Latency:           {min_latency:.2f}ms")
    print(f"   Avg Latency:           {avg_latency:.2f}ms")
    print(f"   95th Percentile (p95): {p95_latency:.2f}ms")
    print(f"   99th Percentile (p99): {p99_latency:.2f}ms")
    print(f"   Max Latency:           {max_latency:.2f}ms")
    print(f"=======================================================\n")

    if failures:
        print("⚠️ Failures encountered (sample):")
        for fail in failures[:5]:
            print(f"   - Req #{fail['id']}: Status={fail['status']}, Error={fail['error']}")
        print()

if __name__ == "__main__":
    run_load_test()
