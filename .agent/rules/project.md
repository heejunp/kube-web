---
trigger: manual
---

프로젝트 명칭 (가제): KubeGarden (쿠브가든)
**"잔디밭 위에서 관리하는 나의 클러스터"**라는 컨셉입니다.

직관적인 인터랙션: kubectl delete pod 대신, 'k' 키를 눌러 파드를 부수어버리는 행위를 통해 쿠버네티스의 자가 치유(Self-healing) 능력을 눈으로 확인합니다.

주요 시각적 요소 (Visual Components)요소3D 형상실제 K8s 매핑바닥 (잔디)넓은 평원 또는 타일전체 클러스터 공간 (Cluster)구역 (Fence)울타리로 나누어진 구역네임스페이스 (Namespace)기단 (Pedestal)단단한 바위 또는 금속판워커 노드 (Worker Node)파드 (Pod)떠 있는 상자, 식물, 또는 로봇실제 파드 객체 (Pod)연결선 (Line)파드 사이를 흐르는 빛의 선서비스/네트워크 (Service/Mesh)

3. 사용자 시나리오 (User Journey)
접속 및 동기화: 페이지에 접속하면 백엔드가 실제 K8s 클러스터 정보를 긁어와 잔디밭 위에 노드와 파드들을 실시간으로 '소환'합니다.

관찰: 각 파드 위에는 실시간 CPU 사용량에 따라 위아래로 들썩이는 애니메이션이 돌아갑니다.

파괴 (The Chaos Engineering): 유저가 특정 파드를 클릭해 파괴합니다.

3D 화면: 파드가 폭발하며 사라짐.

실제 서버: Delete API가 전송되어 실제 컨테이너가 내려감.

복구 (The Self-healing): * 실제 서버: ReplicaSet이 부족한 파드를 감지하고 새 파드를 띄움.

3D 화면: 몇 초 후, 잔디밭에서 새로운 파드가 '뿅' 하고 솟아오름.

4. 기술 스택 구조
이 프로젝트를 성공시키기 위한 3단계 레이어입니다.

L1 (K8s Layer): 실제 운영 중인 클러스터 (k8s).

L2 (Bridge Layer): golang web 서버. K8s API를 Watch하며 상태 변화를 소켓으로 프론트에 전달.

L3 (Visual Layer): React + Three.js (R3F). 전달받은 상태를 잔디밭 위의 3D 오브젝트로 렌더링.

현재 L3 작업중