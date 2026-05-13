import random
print("="*17)
print("= 스트라이크 볼 게임 =")
print("="*17)
n = []
s = 0
b = 0
r = 0
while True:
    r += 1
    for x in ["첫", "두", "세"]:
        i = int(input(x+"번째 값을 입력하세요."))
        n.append(i)
    print("참여자",n)
    m = random.sample(range(1, 10),3)
    print("컴퓨터",m)
    for c in range(0,3):
        for d in range(0,3):
            if n[c] == m[d] and c == d:
                s += 1
            elif n[c] == m[d] and c != d:
                b += 1
    if s == 0 and b == 0:
        print("out \n")
    elif s == 3:
        print(f"{s} strike, {b} ball \n")
        print(f"{r} 번만에 성공하셨습니다.")
        break
    else:
        print(f"{s} strike, {b} ball \n")
    s = 0
    b = 0
    n = []

