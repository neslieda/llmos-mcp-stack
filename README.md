# LLMOS MCP Stack (3-Layer Blueprint)

Bu iskelet, 3 katmanlı mimariyi temel alır:

1. IPA UI Katmanı
- Kullanıcıdan doğal dil komut alır.
- Doğrudan sistem komutu çalıştırmaz.

2. LLMOS Orchestrator Katmanı
- Niyeti çözer, görev planı çıkarır.
- Uygun MCP servisini seçer.
- Hibrit karar verir (yerel/bulut).

3. MCP Servis Katmanı
- `mcp-system`: salt-okunur sistem bilgisi
- `mcp-files`: policy kontrollü dosya işlemleri
- `mcp-rag`: doküman arama / cevaplama
- `mcp-automation`: terminal/gui otomasyon (sandbox)
- `mcp-security`: yetki, onay, policy, audit

## Klasör Yapısı

```txt
llmos-mcp-stack/
  apps/
    ipa-ui/
    orchestrator/
  services/
    mcp-system/
    mcp-files/
    mcp-rag/
    mcp-automation/
    mcp-security/
  shared/
```

## Not

Bu bir başlangıç scaffold'udur. Çalıştırmak için proje bağımlılıklarını (ör. `mcp-use`, `zod`, `express`, `typescript`) ekleyip servis URL'lerini ortama göre güncelle.
