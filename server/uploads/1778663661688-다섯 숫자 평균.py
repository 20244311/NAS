l = []
s = 0 
for i in range(5):
    j = int(input("정수를 입력하시오: "))
    l.append(j)
for k in l:
    s += k
s /= len(l)
print("평균 =", s)
