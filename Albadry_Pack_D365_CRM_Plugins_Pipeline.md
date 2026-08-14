# ALBADRY CONTENT PACK

Topic: D365 CRM Plugins Pipeline
Date: 2026-08-11
Model: qwen/qwen3.6-35b-a3b
Rules: v1
Shorts: 5 + #0

---

## 📅 Publishing Schedule

| Slot | Day | Piece |
|---|---|---|
| 🎬 Long | DAY 0 | Long-Form YouTube Video |
| #0 | DAY −3 | Short #0 · Curiosity (Pre-Launch) |
| #1 | DAY +1 | Short #1 · Biggest Insight |
| #2 | DAY +3 | Short #2 · Common Mistake |
| #3 | DAY +5 | Short #3 · Quick Tip |
| #4 | DAY +7 | Short #4 · Advanced |
| #5 | DAY +9 | Short #5 · Question |

---

## 🎬 LONG-FORM SCRIPT



---
**[0:00] HOOK**
تخيل إنك كتبت Plugin بسيط جداً، بس يغير قيمة حقل واحد. المفاجأة؟ فجأة النظام كله بيقف. الـ UI بيبقى بطيء لدرجة إن المستخدم بيكتب على الـ Ticket: "المشروع بقى ما بيشتغلش". المشكلة مش في الكود اللي كتبته. المشكلة إنك مش فاهم الـ Plugins Pipeline كويس، وده بيخليك تضرب نفسك في الأرض. في الفيديو ده، هنكسر الشفرة خطوة بخطوة، ونعلمك تكتب Plugin ما يخليش النظام يتجمد، ولا يحرق الـ Server.

**[0:20] BRAND**
أهلاً بيكم في قناة "Albadry · AI & Tech Reviewer". القناة دي مخصصة للمطورين، Solution Architects، و Power Platform Consultants اللي بيكبروا في الـ D365 و الـ Power Platform. هنا بنحلل التقنية من الجذع، مش من الورق.

**[0:30] PROMISE**
في الفيديو ده، بتعلم خطوة بخطوة إزاي تستخدم الـ Pipeline صح، تتجنب الـ Transaction Depth اللي بتسبب الـ Infinite Loops، وتحل الـ Bugs اللي بتوقف شغلك وتخليك تضيع ساعات في الـ Debugging. هيروح كل التخمين، وبتبقى عندك خريطة واضحة للتنقل في الـ Execution Pipeline.

**[0:50] STORY**
القصة دي حصلت مع واحد من عملائي في قطاع المبيعات. كل ما حد يعمل Create لـ Account، كان فيه Plugin بيشتغل ويعدل الـ Contact المرتبط. بس المشكلة إن الـ Plugin ده كان بيسجل بـ Synchronous Mode من غير ما يتحكم في الـ Transaction Depth. النتيجة؟ Loop لا نهائي. الـ Plugin بيستدعي نفسه تاني، وتاني، وتاني. الـ SQL Server كان بيحرق الـ CPU 100%، والـ System كان بيقفل نهار كامل. العميل كان محتاج حل سريع، وأنا كنت محتاج أوريك إزاي الـ Pipeline بيشتغل من الأول لآخر، عشان ما تقعوش في الفخ ده.

**[2:00] CONCEPT #1**
خلينا نفتح الصندوق الأسود. الـ Pipeline في D365 مو مجرد "عند ما تعمل Create". ده سلسلة مراحل منظمة: Pre-validation، Pre-operation، Post-operation، و Post-create. كل مرحلة بتشتغل في Transaction مختلف أو نفس الـ Transaction حسب الـ Mode اللي سجلته فيه. الـ `IPluginExecutionContext` هو قلب النظام ده. بيحتوي على `Depth` اللي بتقولك Plugin ده ات استدعى من كام مرة متتالية، و `IsExecuting` اللي بتأكد إن الكود بتاعك هو اللي بيشتغل دلوقتي. وكمان بيحط بينا الـ `PreEntityImage` و `PostEntityImage`. لو استخدمت الـ Images غلط، هتسبب الـ Extra Queries وتبطئ النظام. ولو مسيتش الـ RegisterPluginTool صح، هتلاقي نفسك بتدور على الـ Bug لـ 3 أيام بدون نتيجة.

*(Albadry Says)* هنا قولك: الـ Depth مش رقم عشان تحطه في الـ Log. الـ Depth هو الـ "مفتاح الأمان" بتاعك. أول حاجة تتأكد منها قبل ما تكتب سطر كود واحد.

**[4:00] DEMO**
هوريك الآن الكود العملي. هبدأ بـ `using Microsoft.Xrm.Sdk;` و `public class MyPlugin : IPlugin`. أول سطر في الـ Execute method، هتحط `if (context.Depth > 1) return;`. ده بيوقف الـ Loop من الجذع. بعدين هنتأكد إن الـ Target Entity موجود، وهنستخدم الـ `PreEntityImage` عشان نقرأ البيانات القديمة قبل الـ Save، و `PostEntityImage` لو محتاجين القيم اللي اتحفظت. وهنحيط الـ Logic بـ `try/catch` عشان الـ Exception ما يخليش الـ Transaction كلها تروك باك. لو حصل خطأ، هنستخدم `context.CreateUserControlledException` عشان النظام يظهر الرسالة الصح للمستخدم من غير ما يكسر الـ Save operation.

**[5:30] CONCEPT #2**
دلوقتي خلينا نكبر الصورة. الـ Plugin لو اشتغل في الـ Pre-operation، هيقفل الـ UI لحد ما يخلص الكود. وده مش مقبول في الـ Dashboards الكبيرة أو الـ Forms المعقدة. الحل اللي بيظهر قدامك؟ الـ Async Plugin أو الـ Power Automate Flow. بس هنا المفاجأة... لو اخترت الـ Async، هتلاقي إن الـ Transaction مش هيتأكد إن البيانات اتحفظت أصلاً في الـ Database. الـ Async بيعمل الـ Logic بعد الـ Commit، يعني لو حاجة فاشلة، المستخدم هيبقى شاف البيانات محفوظة، لكن الـ Plugin ما شغلش. دي المعضلة اللي بيوقع فيها المطورين الجدد كل يوم.

**[7:00] TWIST**
بس انتظر، ليه الـ Async بيعتبر "مخادع" أحياناً؟ لأنك بتفقد الـ Synchronous Guarantee. الـ User هيحفظ Record، الـ System هيظهر "Success"، وبعدين بـ 5 ثواني الـ Plugin بيشتغل وبيتحط خطأ في الـ Async Operation Log. المستخدم هيروح يشتكي، وبتتبقى أنت اللي هتسأل "ليه البيانات مش متسابة؟". الحل الواقعي؟ الـ Real-time Logic لازم يكون Synchronous مع Depth Check قوي. الـ Background Logic أو الـ Integration الخارجي لازم يكون Async أو Power Automate مع Retry Logic واضح.

**[8:30] DEEP DIVE**
خلينا نغوص في الـ Best Practices اللي بتفرق بين Developer عادي و Senior. أول حاجة: الـ Registration. استخدم الـ Plugin Registration Tool، وسجل الـ Plugin في الـ Correct Stage و Message. متسجلش Post-operation على Create لحد ما تتأكد إن الـ ID اتولد. تاني حاجة: الـ Image Configuration. اطلب الـ Images اللي محتاجها بس، متطلبش كل الـ Fields عشان ما تضيعش Bandwidth و CPU. تالت حاجة: الـ Transaction Scope. لو الـ Plugin بيشتغل داخل Transaction موجود، استخدم `context.OrganizationServiceProxy` مع `TransactionScopeOption.Suppress` لو محتاج تعمل عمل خارج الـ Transaction الرئيسي. ورابع حاجة: الـ Error Handling. متستخدمش `throw new Exception()` إلا لو لازم توقف النظام. استخدم `InvalidPluginExecutionException` أو `context.CreateUserControlledException` عشان تحافظ على User Experience.

**[10:30] MY TAKE**
رأيي؟ الـ Plugin أداة قوية بس لازم تستخدمها بـ "عقلية النظام". مش كل حاجة Plugin. لو الـ Logic بيسيب على الـ UI أو الـ Real-time Validation، استخدم الـ Synchronous مع الـ Depth Check. لو الـ Logic بيسيب على الـ Background أو الـ Integration، استخدم الـ Async أو الـ Workflow. الـ Pipeline مش عدو، ده الـ System Pulse بتاعك.

*(Albadry Says)* هنا قولك: الـ Copy-Paste من الـ GitHub هو أسرع طريق لـ Technical Debt. اكتب الكود، افهم الـ Context، وادار الـ Trade-off بين السرعة والاستقرار. الـ D365 مش موقع عادي، ده Enterprise System.

**[12:00] TAKEAWAYS**
خلينا نلخص في نقاط سريعة عشان تبقى مرجع سريع:
أولاً: استخدم الـ Pre-Image عشان تقرا البيانات قبل الـ Save، و Post-Image لو محتاجين القيم الجديدة.
ثانياً: دايمًا تحقق الـ `context.Depth > 1` عشان تمنع الـ Infinite Loop.
ثالثاً: اختار الـ Synchronous للـ Real-time، و الـ Async للـ Background، و اتحكم في الـ Transaction Scope بدقة.
رابعاً: سجل الـ Plugin صح في الـ Pipeline Stage، واستخدم الـ Controlled Exceptions ما تخليش المستخدم يتعرض لـ Error Page.

**[13:00] COMMENT CTA**
السؤال ليك انت: انت بتستخدم الـ Plugin في أي حالة في مشروعك؟ ولا بتفضل الـ Power Automate عشان الـ Business Flows؟ اكتبولي في الكومنتات الحالة اللي واجهتها، وأنا هجاوب على كل سؤال، وهختار أحسن الحالات عشان نحللها في فيديو قادم.

**[13:30] SUBSCRIBE**
لو عايز تطور شغلك في D365 و الـ Power Platform، وتتعلم الـ Architecture الحقيقي مش الـ Surface، اشترك في القناة وفعّل الجرس عشان ما تفوتك أي فيديوهات تقنية. الـ Community دي بتكبر كل يوم، وناويين نغطي كل الـ Advanced Patterns.

**[14:00] NEXT**
في الفيديو الجاي، هنتكلم عن الـ Power Automate vs Plugins: إمتى تستخدم أي حاجة، وازاي تربطهم مع بعض بـ الـ Web API و الـ Custom Connectors، عشان تبني System متكامل. اكتبولي في الكومنتات "Pipeline" لو جاهز، وشوفك في الفيديو الجاي.

## 📱 Short #0 · Curiosity (Pre-Launch)



**VIDEO SCRIPT: Pre-Launch Teaser (≤60s)**
**SLOT:** Curiosity / Pre-Launch
**LANGUAGE:** Egyptian Arabic
**TONE:** Confident, Technical, Urgent.

---

| Time | Visual / On-Screen | Audio (Egyptian Arabic) |
| :--- | :--- | :--- |
| **00-03s** | **HOOK**<br>Host close-up, intense eye contact.<br>Text Overlay: "لسه بتكتب Plugin؟ انت بتلعب بالنار! 🔥" | لسه بتكتب Plugin وتقول "أنا هعمل Validate"؟ استنى! انت بتلعب بالنار! |
| **03-10s** | **PROBLEM**<br>Screen recording: Plugin fires, but "Transaction Deadlock" error flashes red instantly.<br>Text: "غلط مرحلة = بيانات تضيع 📉" | كلنا عارفين إن فيه Pipeline stages. بس المشكلة؟ لو اخترت المرحلة غلط، مفيش رسالة خطأ واضحة. الـ System هيعلق، الـ Transaction هيدي deadlock، وبيتمسح بياناتك من غير ما حد يحس. |
| **10-25s** | **CONTEXT + INSIGHT**<br>Animation: 8 Pipeline Stages pop up, highlighting "Pre-Validation" vs "Pre-Create".<br>Text: "8 مراحل مخفية... السر في الـ Timing ⏱️" | الـ Pipeline مش بس On ولا Off. فيه 8 مراحل مخفية، وكل واحدة بتتصرف مع الـ Database بشكل مختلف. السر مش في الكود، السر في الـ "Timing". الـ Pre-Validation يقف قبل الـ DB، والـ Pre-Create بيشتغل جوه الـ Transaction. لو استخدمت مرحلة غلط، الـ Plugin هيشتغل، بس هيخليك تخسر الـ Data Integrity. |
| **25-35s** | **PROOF**<br>Quick cut: Visual Studio screenshot. "Run" button stuck at "Post-Create".<br>Warning Banner: "Silent Failure Detected ⚠️" | [Visual Proof]<br>جربت 3 سيناريوهات، وواحدة منهم سببت كوارث في Production. |
| **35-50s** | **PAYOFF**<br>Host returns, holding a "Full Video" card.<br>Text: "الجواب المفاجئ بكرة 🤫" | الجواب المفاجئ اللي بيسلم الـ Plugin ويخليه يشتغل صح؟ هتلاقوه في الفيديو الكامل اللي بيطلع بكرة. |
| **50-60s** | **CTA**<br>Arrow pointing to "Next Video" button.<br>Text: "اطلع من الـ Pipeline Trap 👇" | متفوتش الفيديو الكامل اللي هيشرح كل مرحلة بالتفصيل. اضغط على "شاهد الفيديو التالي" دلوقتي واطلع من الـ Pipeline Trap. |

---

**ALBADRY NOTES:**
*   **Pacing:** The script is ~40 seconds spoken at a normal-fast technical pace, leaving room for visual transitions. This ensures the viewer stays engaged without feeling rushed.
*   **Tension:** We explicitly mention "Deadlock" and "Data Loss" to trigger developer anxiety, then immediately tease the solution ("Timing" and "Full Video") to drive the click.
*   **No Spoilers:** We explain *why* it breaks (Timing/Transaction interaction) but never show the specific stage configuration that fixes it. The answer remains locked behind the full video.
*   **Egyptian Nuance:** Used terms like "بيتمسح", "جوه", "هتلاقوه" to maintain the authentic Albadry voice while keeping technical terms in English for clarity.

## 📱 Short #1 · Biggest Insight



**[0:00-0:03] HOOK**
*(Camera: Face-to-camera, direct eye contact. Text overlay: "مشكلة الـ Pipeline!")*
بتكتب Plugin وتاخد خطأ أو بيزبط بطيء؟ المشكلة مش في الكود، المشكلة في الـ Pipeline!

**[0:03-0:10] PROBLEM**
*(Camera: Quick cut to frustrated dev gesture. Text: "كل المنطق في مرحلة واحدة = كوارث")*
معظم المطورين بيحطوا كل المنطق في مرحلة واحدة، وده بيخلي النظام يتبطأ وبيسبب مشاكل في البيانات المتزامنة.

**[0:05-0:15] CONTEXT**
*(Camera: Screen recording of Plugin Registration Tool / Pipeline diagram. Text: "4 مراحل | وقت تنفيذ مختلف")*
الـ Plugin Pipeline في D365 بيعتمد على 4 مراحل أساسية: Pre-Validation، Pre-Operation، Post-Operation، وPost-Processing. كل مرحلة لها دور محدد ووقت تنفيذ مختلف.

**[0:10-0:35] CORE INSIGHT**
*(Camera: Split screen: Left = Speaker, Right = Animated pipeline flow. Text highlights match speech.)*
القاعدة الذهبية: لو عايز تتأكد من بيانات بسيطة وسريعة، استخدم Pre-Validation. لو عايز تقرا أو تعدل بيانات من قاعدة البيانات، لازم تستخدم Pre-Operation. لو عايز تقرأ البيانات بعد الحفظ، استخدم Post-Operation. وتخلي Post-Processing للأنظمة الخارجية بس. الـ Pipeline بيشتغل بالترتيب، فاختيار المرحلة غلط بيكسر عملية الحفظ أو يهدر موارد السيرفر.

**[0:35-0:50] PROOF + PAYOFF**
*(Camera: Code snippet on screen: `context.Stage.ToString()`. Highlight `Stage == 10`. Cut back to speaker.)*
على الشاشة، كود C# بيطبع الـ Context.Stage. لو حطيت كود DB في Pre-Validation هيتسحب قبل ما النظام يخليك تحفظ، وده هيكسر الـ Transaction. اختار المرحلة بتاعة المنطق بتاعك، وابعد عن الـ Database calls في مراحل الـ Validation. الكود الصحيح = أداء أسرع + استقرار أعلى.

**[0:50-0:60] CTA**
*(Camera: Confident nod. Text: "جربه دلوقتي | اكتب الـ Stage بتاعك في الكومنتات")*
جرب تطبقها على الـ Plugin بتاعك دلوقتي، وابعلي في الكومنتات أي Stage بتاعك محتاج مساعدة فيه.

---
**🎬 Production Notes:**
- **Pacing:** ~45 seconds spoken. Leave 2-3s buffer for on-screen code & pipeline graphics.
- **Visuals:** Keep text overlays bold & high-contrast. Use `Pre-Validation: checks سريعة | Pre-Operation: DB & Logic | Post-Operation: Read-only | Post-Processing: Async/Cleanup` as a persistent lower-third during the CORE INSIGHT.
- **Audio:** Clean voiceover, subtle UI click SFX on code transitions, no background music during technical explanation.

## 📱 Short #2 · Common Mistake



[HOOK] (0:00-0:03)
**VO:** بتسجل الـ Plugin بتاعك في الـ Pre-stage وتوقع تقرأ الـ ID؟ هتلاقي Null وخايف يوقفك الـ Error!
**ONSCREEN:** `Pre-Stage` ❌ → `ID = Null` 🚫

[PROBLEM] (0:03-0:10)
**VO:** معظم المطورين بيخلطوا بين Pre-Create و Pre-Update، وبيحاولوا يقرؤوا الحقول اللي الـ CRM بيولدها لوحده، وده بيسبب أخطاء و Performance مشاكل.
**ONSCREEN:** `Pre-Create/Update` → `Trying to read system fields` ⚡📉

[CONTEXT] (0:10-0:15)
**VO:** في D365 كل Plugin بيعتمد على الـ Pipeline Stage، وكل مرحلة ليها قواعد مختلفة، وبتتعامل مع الـ Context بشكل مختلف.
**ONSCREEN:** `Pipeline Stages` → `Different Rules` 🔄

[CORE INSIGHT] (0:15-0:35)
**VO:** الـ Pre-stage ده قبل ما الـ CRM يدوس Record، يعني الـ ID مش موجود لحد ما يتحفظ. لو عايز تقرأ System Fields أو الـ ID، لازم تستخدم Post-stage، أو تستخدم الـ OutputParameters في الـ Pre. وده بيوفر عليك ساعات ديبة ويخلي الـ Plugin يشتغل بأمان وسرعة.
**ONSCREEN:** `Pre = Before Save` → `ID Unavailable` 🕒
**ONSCREEN:** ✅ `Post-Stage` or `OutputParameters["id"]`

[PROOF] (0:35-0:45)
**VO:** في الكود، بدل ما تكتب `entity["accountid"]` في الـ Pre، استخدم `context.OutputParameters["id"]` أو سجل الـ Plugin في Post-Create.
**ONSCREEN:** `❌ entity["accountid"]` → `✅ context.OutputParameters["id"]` 💻

[PAYOFF] (0:45-0:50)
**VO:** Albadry Says: افهم الـ Pipeline كويس، واختار المرحلة الصح، وده بيحول الـ Plugin من Cause Problem لـ Solution قوي.
**ONSCREEN:** `Wrong Stage` 🚫 → `Right Stage` ✅ = `Stable Plugin` 🛡️

[CTA] (0:50-0:60)
**VO:** ابعتلّي "Pipeline" في الكومنتات وهبعتلك Template جاهز، ولازم تشترك عشان متفوتش الـ Deep Dive التالي.
**ONSCREEN:** Comment: `Pipeline` 📩 → Subscribe 🔔 → `Next: Sandbox Isolation` 🧪

## 📱 Short #3 · Quick Tip



**TITLE:** مفيش 500 Error تاني! ترتيب Plugins في D365 صح
**FORMAT:** Short-Form Script (YouTube Shorts / Reel)
**DURATION:** ~45-50 Seconds
**LANGUAGE:** Egyptian Arabic
**TONE:** Confident, Technical, Direct.

---

### 🎬 SHORT-FORM SCRIPT: D365 Plugin Pipeline Tip

| Time | Visual / On-Screen | Audio (Egyptian Arabic) |
| :--- | :--- | :--- |
| **00:00** | **HOOK**<br>🎥 *Face to Camera / Code Snippet of 500 Error popping up.*<br>📢 **TEXT:** 500 Error؟ Plugin بيكسر النظام؟ | لسه بتكتب Plugin وبتظهرلك 500 Error غريبة؟ أو الكود بيكسر النظام؟ |
| **00:03** | **PROBLEM**<br>🎥 *Split screen: Wrong Stage vs. Correct Stage. Icon: ⚠️ Bug / 🐌 Slow.*<br>📢 **TEXT:** خلط المراحل = بطء + Bugs | المشكلة إن المبرمجين بيخلطوا مراحل الـ Pipeline. بيحدثوا بيانات قبل ما تتتحقق، أو ياخدوا بيانات قديمة، وده بيخلي النظام بطيء وبيظهر Bugs مفيش لها حل. |
| **00:10** | **CONTEXT**<br>🎥 *Graphic: 4 Stages appear one by one.*<br>📢 **TEXT:** Pre-validation \| Pre-operation \| Post-operation \| Post-validation | الـ Pipeline في D365 مقسم لأربع مراحل: Pre-validation, Pre-operation, Post-operation, وPost-validation. كل مرحلة ليها هدفها وبياناتها المختلفة. |
| **00:15** | **CORE INSIGHT**<br>🎥 *Code Editor: Highlighting `Stage = 20` vs `Stage = 40`.*<br>📢 **TEXT:** Pre-Op = تعديل/Validation \| Post-Op = Logging/Workflow | النصيحة: لو عايز تعدل بيانات أو تعمل Validation، سجل الـ Plugin في مرحلة Pre-operation. لو عايز تعمل Logging أو Trigger لـ Workflow، سجله في Post-operation. |
| **00:22** | **INSIGHT CONT.**<br>🎥 *Zoom in on `Depth` variable. Warning icon: 🔁 Loop.*<br>📢 **TEXT:** استخدم Depth > 1 عشان متدخلش Loop | وده أهم حاجة: استخدم Depth عشان متدخلش في Loop. |
| **00:26** | **PROOF**<br>🎥 *Code snippet showing `PreImage` / `PostImage` registration. Red X if missing.*<br>📢 **TEXT:** حدد Stage \| Message \| ExecutionMode \| Image | في الـ Code، لازم تحدد Stage و Message و ExecutionMode، وده أهم حاجة: الـ Image زي PreImage أو PostImage. لو نسيت الـ Image، هتاخد بيانات قديمة وتفسد العملية. |
| **00:34** | **PAYOFF**<br>🎥 *Green Checkmark system animation. Speed up icon.*<br>📢 **TEXT:** المرحلة الصح + Images + Depth > 1 = System Fast \| No Transaction Errors | حدد المرحلة صح، استخدم الـ Images المناسبة، ومتنساش الـ Depth > 1. النظام هيشتغل أسرع، وبتتجنب مشاكل الـ Transaction اللي بتكسر البيانات. |
| **00:42** | **CTA**<br>🎥 *Face to Camera. Button: Subscribe / Link to Video.*<br>📢 **TEXT:** جربها Sandbox 🧪 \| الفيديو الطويل في البايو \| اشترك | جربها على بيئة الـ Sandbox دلوقتي، والباقي في الفيديو الطويل. اشترك عشان ما تفوتكش أي خدعة تقنية. |

---

### 📝 Production Notes for Albadry:
*   **Pacing:** Keep the delivery fast but clear on technical terms (Pre-validation, Pre-operation, Depth, Image).
*   **Emphasis:** Stress "Pre-operation للتعديل" and "Post-operation للـ Workflow" as this is the core actionable tip.
*   **Visuals:** When mentioning `Depth > 1`, show a code snippet `if (context.Depth > 1) return;` for instant clarity.
*   **Albadry Says:** The tone is already sharp. No extra fluff needed; the value is in the distinction between stages and the importance of Images.

### 🏷️ Metadata:
*   **Caption:** مفيش 500 Error تاني! 🛑 ترتيب Plugins في D365 صح. شرح مراحل الـ Pipeline وازاي تختار المرحلة المناسبة عشان نظامك ما يتكسرش. #D365 #CRM #Plugins #TechTips #Albadry
*   **Hashtags:** #D365 #Dynamics365 #PluginPipeline #PreOperation #PostOperation #D365Developer #TechTips #Albadry
*   **Thumbnail Text:** Plugin بيكسر النظام؟ 🚫 | الحل في الـ Pipeline 🛠️

## 📱 Short #4 · Advanced



🎬 **SHORT-FORM SCRIPT (≤60s) | Egyptian Arabic | Advanced Slot**
**Channel:** Albadry · AI & Tech Reviewer
**Format:** YouTube Shorts / Reel
**Pacing:** ~145 WPM (Tight, high-retention delivery)

---

**[0:00-0:03] HOOK**
*(Visual: Split screen: broken plugin code vs. “Loop?” warning)*
**Audio:** بتكتب بلاجن في داتاس 365 وبتحصل خطأ غريب أو Loop ما بيعملش؟ المشكلة مش في الكود، المشكلة في المراحل!
**On-Screen:** 8 Pipeline Stages | ⚠️ Loop؟ المشكلة في المراحل!

**[0:03-0:10] PROBLEM**
*(Visual: Arrows showing Pre-Validation vs Pre-Operation confusion)*
**Audio:** معظم المطورين بيخلطوا بين Pre-Validation و Pre-Operation. النتيجة؟ بيانات مش بتتحفظ صح، أو الـ Plugin بيشتغل مرة تانية لآخر الدنيا.
**On-Screen:** Pre-Validation ≠ Pre-Operation | ❌ بيانات مش محفوظة | ❌ Plugin بيكرر

**[0:10-0:15] CONTEXT**
*(Visual: Pipeline diagram lighting up 8 stages sequentially)*
**Audio:** في 8 مراحل أساسية في الـ Pipeline بتتحرك قبل ما الطلب يوصل للـ Database. كل مرحلة ليها هدف محدد، وخطأ في التوقيت بيكسر النظام.
**On-Screen:** 8 Pipeline Stages | ⏱️ Timing is everything

**[0:15-0:35] CORE INSIGHT**
*(Visual: Code snippet highlighting `StepNumber` & `IPluginExecutionContext`)*
**Audio:** السر إنك متتعتمدش على الـ Target Entity لوحدها. استخدم الـ StepNumber و IPluginExecutionContext عشان تعرف بالضبط الـ Plugin اللي جاي قبلك اتعمل إيه. لو بتعمل Validation Plugin، متعملش Business Logic هنا. الـ Business Logic لازم يكون Post-Operation. وده اللي بيخلي الكود Maintainable وبيمنع الـ Recursive Calls.
**On-Screen:** StepNumber + PreEntityImages | ✅ Pre-Validation = Check Only | ✅ Post-Operation = Business Logic
**Albadry Says:** Treat Pipeline like a Traffic System 🚦

**[0:35-0:45] PROOF**
*(Visual: Quick code callout: `context.OutputParameters["id"]`)*
**Audio:** في الكود، هتسجل الـ Plugin بـ StepNumber زائد 1، وتستخدم `context.OutputParameters["id"]` عشان تاخد الـ GUID بعد ما يتحفظ. وده بيحل مشكلة الـ Create/Update الـ Cross-Instance.
**On-Screen:** StepNumber + 1 | 🔑 context.OutputParameters["id"] | ✅ Cross-Instance Fixed

**[0:45-0:50] PAYOFF**
*(Visual: Speed test graphic + clean console output)*
**Audio:** النتيجة؟ Plugin أسرع، أقل أخطاء، وأسهل في الـ Debugging. خليك Pro وتعامل الـ Pipeline كـ System مش كـ Script عادي.
**On-Screen:** ⚡ Faster | 🐛 Less Bugs | 🛠️ Easier Debug

**[0:50-0:60] CTA**
*(Visual: Channel logo + Subscribe button animation)*
**Audio:** جرب التقنية دي في مشروعك الجاي، وشارك التجربة. ولا تنسى Subscribed عشان نوصلك لأعمق الـ Tech في الـ Microsoft Ecosystem.
**On-Screen:** 👇 جربها وشاركنا | 🔔 Subscribe for Deep Tech

---
✅ **Delivery Notes:** 
- Keep voice crisp and authoritative. Emphasize technical terms in English (Pre-Validation, StepNumber, OutputParameters) as is standard in Egyptian dev circles.
- Pause 0.2s after “المشكلة في المراحل!” for retention.
- All text matches the provided prompt exactly, structured for maximum short-form retention. Standalone technical value preserved. No filler. Ready to record.

## 📱 Short #5 · Question



🎬 **[0:00-0:03] HOOK**
*(على الشاشة: Plugin بيتسحب؟ المشكلة من الـ Pipeline مش الكود!)*
بتسحب من الـ Plugin بتاعك؟ المشكلة غالباً من الـ Pipeline مش من الكود!

🎬 **[0:03-0:10] PROBLEM**
*(على الشاشة: Create/Update = خطوات متسلسلة | ترتيب غلط = بيانات غلط / Loop / Crash)*
كل Create أو Update ينفذ خطوات متسلسلة. لو مفيش ترتيب، هتلاقي بيانات مش متحفظانة صح، Loop لا نهائي، أو حتى System Crash.

🎬 **[0:10-0:15] CONTEXT**
*(على الشاشة: Pipeline = 12 مرحلة | Pre-validation → Post-operation)*
الـ Pipeline في D365 مقسّم لـ 12 مرحلة. من Pre-validation لحد Post-operation. كل مرحلة ليها دور محدد في الـ Database Transaction.

🎬 **[0:15-0:35] CORE INSIGHT**
*(على الشاشة: Pre = قبل DB | Post = بعد Commit | Stage 10 vs 50)*
السر إن الـ Pre-stages بتشتغل قبل ما البيانات تروح للـ DB، وPost-stages بعد الـ Commit. عشان الـ Update ينفذ بعد الـ Create بنفس الـ Entity، لازم تتحكم في الـ Stage Number. رقم 10 يعني Pre، ورقم 50 يعني Post.

🎬 **[0:35-0:45] PROOF**
*(على الشاشة: Plugin Registration Tool | غيّر Step: 50 → 10 | شوف Trace Log)*
افتح Plugin Registration Tool. غيّرت الـ Step من 50 لـ 10. شوف الـ Trace Log. التنفيذ بيسير بالترتيب الصح.

🎬 **[0:45-0:50] PAYOFF**
*(على الشاشة: Pipeline = ضمانة الـ Business Logic | Stage 10: تحقق | Stage 50: تنفيذ)*
الـ Pipeline مش مجرد ترتيب، ده ضمانة إن الـ Business Logic ينفذ صح. استخدم Stage 10 للتحقق، وStage 50 للتنفيذ النهائي.

🎬 **[0:50-0:60] CTA**
*(على الشاشة: انت بتستخدم Stage 10 ولا 50؟ | اكتب أخطر Plugin Bug 👇)*
انت بتستخدم Stage 10 ولا 50 أكتر؟ واكتبلي في الكومنتات أخطر Plugin سببلك Bug في مشروعك. ده Albadry، وشوفك في الفيديو الجاي.

## 🎞 MONTAGE PLANS (CapCut)

### Long

| Time | Shot | Camera | On-screen | Transition | Audio | CapCut tip | Note |
|---|---|---|---|---|---|---|---|
| 0:00-0:05 | talking-head | close-up | تخيل Plugin بسيط بس يوقف النظام كله | jump cut | tense ambient music / low hum | Use Transform keyframes for slow push-in during 'يتجمد'. | Start with direct eye contact, slight zoom on 'يتجمد' |
| 0:05-0:10 | screen | over-shoulder | UI بطيء + Ticket: المشروع بقى ما بيشتغلش | cut | music continues / typing SFX | Use Crop → 16:9 and Smart Cutout to isolate the ticket popup. | Screen recording of CRM form loading slowly |
| 0:10-0:15 | b-roll | medium | المشكلة مش في الكود، المشكلة في الـ Pipeline | push | music dips / server fan SFX | Apply Adjust → Contrast/Sharpness to make graphic pop, use Transitions menu → Push for entry. | Server rack or abstract network graphic |
| 0:15-0:20 | talking-head | close-up | هنكسر الشفرة خطوة بخطوة | cut | music builds | Use Auto Captions with custom font/style, enable Safe Zone toggle. | Direct address, confident gesture |
| 0:20-0:25 | talking-head | medium | أهلاً بيكم في قناة Albadry · AI & Tech Reviewer | cut | upbeat tech intro / SFX | Use Text → Templates for lower third, animate with Keyframes. | Lower third animation |
| 0:25-0:30 | graphic | static | مخصصة لـ D365 & Power Platform Consultants | zoom bump | music fades slightly | Use Layers to stack logo, apply Effects → Glitch sparingly. | Channel branding/mission statement |
| 0:30-0:40 | talking-head | medium | بتعلم تستخدم الـ Pipeline صح | cut | steady background track | Use Face Retouch lightly, enable Stabilize if handheld. | Clear delivery, hand gestures for emphasis |
| 0:40-0:50 | graphic | static | تتجنب Transaction Depth و Infinite Loops | j-cut | music continues | Use Speed → curve to slow down graphic fade-in, add Auto Captions. | Roadmap/Checklist graphic |
| 0:50-1:10 | talking-head | medium | القصة دي حصلت مع واحد من عملائي في المبيعات | cut | narrative tone / SFX | Use Pan camera movement manually via keyframes, add Transitions menu → Fade. | Storytelling pacing, slight pan |
| 1:10-1:30 | screen | over-shoulder | Create لـ Account → Plugin يعدل Contact | cut | keyboard/mouse SFX | Use Crop → 16:9, highlight cursor with stickers → Arrow, use Keyframes to follow cursor. | CRM interface showing Account/Contact forms |
| 1:30-1:50 | b-roll | medium | Loop لا نهائي + SQL Server يحرق CPU 100% | l-cut | rising tension / fan noise SFX | Use Adjust → Brightness/Contrast, apply Effects → Heat Distortion subtly. | Server monitoring dashboard |
| 1:50-2:00 | talking-head | close-up | العميل محتاج حل، وأنا محتاج أوريك الـ Pipeline | cut | music resolves | Use Auto Captions, enable Safe Zone, add Transitions menu → Slide. | Confident nod, direct eye contact |
| 2:00-2:30 | talking-head | close-up | خلينا نفتح الصندوق الأسود. الـ Pipeline مو مجرد Create | cut | educational tone / SFX | Use Transform keyframes for slight zoom, apply Retouch for clean skin. | Pacing shift to technical breakdown |
| 2:30-3:00 | screen | static | Pre-validation → Pre-operation → Post-operation | cut | steady track | Use Layers to animate stages sequentially, add Auto Captions. | Pipeline stage diagram |
| 3:00-3:30 | graphic | static | IPluginExecutionContext: Depth, IsExecuting, Pre/PostImages | zoom bump | music dips | Use Speed → curve for zoom-in, apply Adjust → Blur to background. | Core object properties graphic |
| 3:30-4:00 | talking-head | close-up | (Albadry Says) الـ Depth هو مفتاح الأمان | cut | serious tone / SFX | Use Text → Templates for callout box, animate with Keyframes. | Emphasize safety concept |
| 4:00-4:20 | screen | over-shoulder | using Microsoft.Xrm.Sdk; public class MyPlugin : IPlugin | cut | coding focus / typing SFX | Use Crop → 16:9, highlight syntax with stickers → Highlighter. | VS Code/Visual Studio window |
| 4:20-4:45 | screen | static | if (context.Depth > 1) return; | l-cut | steady track | Use Transform keyframes to zoom into the line, apply Auto Captions. | Critical code line |
| 4:45-5:15 | screen | over-shoulder | PreEntityImage / PostEntityImage + try/catch | cut | technical pacing | Use Layers to stack comments, apply Effects → Glow to try/catch block. | Code structure explanation |
| 5:15-5:30 | talking-head | medium | context.CreateUserControlledException عشان رسالة صحيحة | cut | reassuring tone | Use Transitions menu → Push, enable Safe Zone. | Error handling explanation |
| 5:30-5:50 | talking-head | medium | دلوقتي خلينا نكبر الصورة. الـ Plugin في Pre-operation | cut | analytical tone / SFX | Use Pan keyframes, apply Retouch for consistency. | Shift to architecture discussion |
| 5:50-6:20 | graphic | static | Pre-operation يوقف الـ UI لحد ما يخلص الكود | j-cut | steady track | Use Speed → curve for slow fade, add stickers → Warning icon. | UI freeze visualization |
| 6:20-6:45 | screen | over-shoulder | الحل؟ Async Plugin أو Power Automate Flow | cut | solution tone | Use Crop → 16:9, highlight nodes with stickers → Circle. | Flow builder interface |
| 6:45-7:00 | talking-head | close-up | لو اخترت Async، الـ Transaction مش هيتأكد إن البيانات اتحفظت | cut | cautionary tone / SFX | Use Transform keyframes for push-in, apply Auto Captions. | Direct warning delivery |
| 7:00-7:20 | talking-head | close-up | بس انتظر، ليه الـ Async بيعتبر 'مخادع' أحياناً؟ | cut | suspense tone | Use Transitions menu → Zoom, enable Safe Zone. | Hook for next segment |
| 7:20-7:45 | graphic | static | User يحفظ → System يظهر Success → Plugin يشتغل بعد 5 ثواني | l-cut | ticking SFX | Use Layers to animate timeline, apply Adjust → Contrast. | Timeline visualization |
| 7:45-8:15 | screen | over-shoulder | Async Operation Log + User شكوى | cut | problem tone | Use Crop → 16:9, highlight log entry with stickers → Red Box. | CRM logs interface |
| 8:15-8:30 | talking-head | medium | الحل الواقعي؟ Synchronous مع Depth Check قوي | cut | resolution tone | Use Auto Captions, apply Retouch, enable Stabilize. | Clear directive |
| 8:30-8:50 | talking-head | medium | خلينا نغوص في الـ Best Practices. أول حاجة: الـ Registration | cut | instructional tone / SFX | Use Transform keyframes, apply Transitions menu → Fade. | Shift to advanced tips |
| 8:50-9:15 | screen | static | Plugin Registration Tool: Correct Stage & Message | cut | technical focus | Use Crop → 16:9, highlight dropdowns with stickers → Arrow. | PRT interface |
| 9:15-9:40 | screen | over-shoulder | Image Configuration: اطلب اللي محتاجه بس | l-cut | steady track | Use Speed → curve for zoom, apply Auto Captions. | Configuration panel |
| 9:40-10:05 | screen | static | TransactionScopeOption.Suppress لحالات الـ Background | cut | advanced tone | Use Transform keyframes, apply Effects → Blur to background. | Code snippet |
| 10:05-10:30 | talking-head | close-up | Error Handling: متستخدمش throw new Exception() إلا للضرورة | cut | authoritative tone / SFX | Use Transitions menu → Push, enable Safe Zone. | Final best practice |
| 10:30-10:50 | talking-head | medium | رأيي؟ الـ Plugin أداة قوية بس لازم تستخدمها بـ 'عقلية النظام' | cut | reflective tone | Use Pan keyframes, apply Retouch. | Architecture mindset |
| 10:50-11:10 | graphic | static | Synchronous للـ Real-time + Depth Check \| Async للـ Background | j-cut | steady track | Use Layers to animate branches, apply Adjust → Brightness. | Decision matrix |
| 11:10-11:30 | talking-head | close-up | (Albadry Says) Copy-Paste من GitHub هو أسرع طريق لـ Technical Debt | cut | warning tone / SFX | Use Transform keyframes for zoom, apply Auto Captions. | Direct advice |
| 11:30-12:00 | talking-head | medium | اكتب الكود، افهم الـ Context، وادار الـ Trade-off | cut | professional tone | Use Transitions menu → Slide, enable Safe Zone. | Senior developer mindset |
| 12:00-12:15 | talking-head | medium | خلينا نلخص في نقاط سريعة عشان تبقى مرجع سريع | cut | summary tone | Use Auto Captions, apply Retouch. | Transition to recap |
| 12:15-12:30 | graphic | static | أولاً: Pre-Image للبيانات القديمة، Post-Image للقيم الجديدة | l-cut | steady track | Use Speed → curve for fade, add stickers → Checkmark. | Recap point 1 |
| 12:30-12:45 | graphic | static | ثانياً: context.Depth > 1 عشان تمنع الـ Infinite Loop | cut | summary tone | Use Transform keyframes, apply Auto Captions. | Recap point 2 |
| 12:45-13:00 | graphic | static | ثالثاً: Synchronous للـ Real-time، Async للـ Background | cut | summary tone | Use Transitions menu → Push, enable Safe Zone. | Recap point 3 |
| 13:00-13:15 | talking-head | close-up | السؤال ليك انت: Plugin ولا Power Automate؟ | cut | engaging tone / SFX | Use Pan keyframes, apply Retouch. | Direct question to audience |
| 13:15-13:30 | graphic | static | اكتبولي الحالة اللي واجهتها، هجاوب وأحللها في فيديو قادم | j-cut | steady track | Use Layers to animate comment bubble, apply Adjust. | Comment prompt |
| 13:30-13:45 | talking-head | medium | لو عايز تطور شغلك في D365 و الـ Power Platform... | cut | closing tone | Use Transitions menu → Fade, enable Safe Zone. | Subscribe call |
| 13:45-14:00 | graphic | static | اشترك في القناة وفعّل الجرس عشان ما تفوتك أي فيديوهات تقنية | cut | upbeat outro | Use Speed → curve for pop-in, add stickers → Bell. | Subscribe/Notification bell |
| 14:00-14:15 | talking-head | close-up | في الفيديو الجاي، Power Automate vs Plugins... | cut | teaser tone / SFX | Use Transform keyframes, apply Auto Captions. | Next video preview |
| 14:15-14:30 | graphic | static | اكتبولي 'Pipeline' لو جاهز، وشوفك في الفيديو الجاي. | l-cut | music fades | Use Transitions menu → Zoom, enable Safe Zone. | Final CTA |

### Short #0 · Curiosity (Pre-Launch)

| Time | Shot | Camera | On-screen | Transition | Audio | CapCut tip | Note |
|---|---|---|---|---|---|---|---|
| 0:00-0:03 | talking-head | close-up | لسه بتكتب Plugin؟ انت بتلعب بالنار! 🔥 | cut | tense tech music / SFX: sharp whoosh | Use `Auto Captions` set to Egyptian Arabic, apply `Text` → `Animation` → `Typewriter`, and add `Transition` → `Zoom Bump` exactly on 'النار'. | Hold intense eye contact, lean in slightly on 'النار'. Keep background dark to isolate face. |
| 0:03-0:10 | screen | static | غلط مرحلة = بيانات تضيع 📉 | jump cut | music drops to low drone / SFX: red error beep + static glitch | Use `Keyframes` on `Transform` to animate a smooth zoom on the error box, place a `Stickers` → 'Warning' icon, and adjust `Speed` → `Curve` to 0.8x for dramatic pause. | Punch-in digitally to the error box at 0:05. Add a subtle red flash overlay when the deadlock appears. |
| 0:10-0:25 | graphic | slow push-in | 8 مراحل مخفية... السر في الـ Timing ⏱️ | push | steady tech pulse builds / SFX: click/pop on stage reveal | Use `Text` → `Animation` → `Typewriter` for stage labels, apply `Mask` → `Linear` to reveal the DB transaction box, and use `Keyframes` on `Opacity` for smooth fade-in. | Animate 8 stages appearing sequentially. Visually highlight 'Pre-Validation' (blue) vs 'Pre-Create' (red) to emphasize timing difference. |
| 0:25-0:35 | screen | zoom | Silent Failure Detected ⚠️ | jump cut | SFX: progress bar stuck hum / low warning pulse | Use `Overlay` → `Blend Mode` → `Screen` for the warning banner, apply `Auto Reframe` to keep the code block centered, and add `Effects` → `Glitch` at 0:28. | Zoom directly into the 'Post-Create' status in VS. Add a pulsing red warning banner over the code area. |
| 0:35-0:50 | talking-head | medium | الجواب المفاجئ بكرة 🤫 | cut | music shifts to anticipatory/upbeat / SFX: light card flip | Place a `Stickers` → `Arrow` pointing to the card, apply `Keyframes` on `Scale` (100% → 105%), and add `Filters` → `Cinematic` for background depth. | Hold the 'Full Video' card steady, apply a slight slow push-in, and return to direct eye contact for authority. |
| 0:50-1:00 | screen | static | اطلع من الـ Pipeline Trap 👇 | zoom | music resolves (clear/confident) / SFX: crisp click/confirm | Use `Text` → `Typewriter` for the CTA, apply `Animation` → `Bounce` to the arrow, track `Position` with `Keyframes`, enable the `Safe Zone` guide, and export at 1080x1920 60fps. | Animate the arrow bouncing toward the 'Next Video' placeholder. Keep all text strictly inside the 9:16 safe zone. |

### Short #1 · Biggest Insight

| Time | Shot | Camera | On-screen | Transition | Audio | CapCut tip | Note |
|---|---|---|---|---|---|---|---|
| 0:00-0:03 | talking-head | close-up | مشكلة الـ Pipeline! | cut | subtle UI click SFX on text pop | Use 'Text' → 'Auto Captions' to generate Arabic text, then apply 'Animation' → 'Typewriter' for the hook. | Direct eye contact. Hold frame steady. Keep text centered in safe zone. |
| 0:03-0:08 | talking-head | medium | كل المنطق في مرحلة واحدة = كوارث | jump cut | voiceover continues, slight background hum | Apply 'Cutout' → 'Auto Cutout' to isolate speaker, then use 'Keyframes' on 'Transform' to add a subtle slow push-in for tension. | Quick cut to frustrated gesture. Maintain eye-level framing. |
| 0:08-0:15 | screen | static | 4 مراحل \| وقت تنفيذ مختلف | push | mouse click SFX on diagram highlight | Use 'Transform' keyframes to punch in from medium to close-up on the diagram. Apply 'Adjust' → 'Sharpen' slightly to make technical text pop. | Screen recording of Plugin Pipeline diagram. Zoom into the 4 stages. |
| 0:15-0:35 | graphic | static | Pre-Validation: checks سريعة \| Pre-Operation: DB & Logic \| Post-Operation: Read-only \| Post-Processing: Async/Cleanup | cut | voiceover clear, no music | Use 'Compositing' → 'Blend Mode: Screen' or 'Overlay' for the split layout. Sync text pop-ups with speech using 'Keyframes' on opacity and 'Text' → 'Scroll' for the lower-third. | Split screen: Left = Speaker (cutout), Right = Animated pipeline flow. Text highlights match speech. |
| 0:35-0:50 | code | over-shoulder | context.Stage.ToString() \| Stage == 10 | zoom bump | keyboard tap SFX, subtle whoosh on highlight | Use 'Keyframes' on 'Transform' to zoom into the code line. Apply 'Adjust' → 'HSL' to change highlight color to bright green. Add 'Effects' → 'Glitch' briefly on the cut back to speaker. | Code snippet on screen. Highlight `Stage == 10`. Cut back to speaker. |
| 0:50-0:60 | talking-head | medium | جربه دلوقتي \| اكتب الـ Stage بتاعك في الكومنتات | cut | voiceover confident, end with subtle chime | Use 'Text' → 'Sticker' for a 'Subscribe/Follow' arrow if needed, but keep it minimal. Apply 'Adjust' → 'Vignette' to focus eyes. Use 'Auto Captions' for CTA with 'Animation' → 'Pop'. | Confident nod. Text stays in lower safe zone. Add subtle background music fade-in. |

### Short #2 · Common Mistake

| Time | Shot | Camera | On-screen | Transition | Audio | CapCut tip | Note |
|---|---|---|---|---|---|---|---|
| 0:00-0:03 | talking-head \| graphic | medium \| slow push-in | Pre-Stage ❌ → ID = Null 🚫 | cut | tense SFX (error beep) → beat drop | Use Keyframes on Transform (scale 100% → 110%) with Smooth easing for the slow push-in. | Start with direct eye contact. Hold frame steady for 2s, then trigger slow zoom for tension. Keep text inside 9:16 safe zone (center 80%). |
| 0:03-0:07 | screen \| code | static \| zoom | Pre-Create/Update → Trying to read system fields ⚡📉 | jump cut | keyboard typing SFX + low hum | Use Auto Captions for the Arabic VO, then add Text → Typewriter effect to the error warning with a red stroke. | Show CRM plugin registration UI briefly, then cut to code snippet highlighting Pre-Create. Punch-in to the problematic line. |
| 0:07-0:10 | screen \| code | over-shoulder \| pan | Pre-Create/Update → Trying to read system fields ⚡📉 | j-cut | warning SFX continues | Apply Mask → Split to isolate the code block, then use Adjust → Vignette (level 20) to darken edges and focus attention. | Pan right to show InputParameters vs OutputParameters mismatch. Keep focus on the dictionary access line. |
| 0:10-0:15 | graphic | wide \| static | Pipeline Stages → Different Rules 🔄 | push | subtle UI click SFX + background music rises | Use Shapes to draw the pipeline flow, then animate with Keyframes (position Y) moving the diagram upward smoothly. | Display animated pipeline diagram (Pre, Post, Post-Delete). Keep it clean, no clutter. Sync push transition with music swell. |
| 0:15-0:25 | talking-head | close-up \| static | Pre = Before Save → ID Unavailable 🕒 | cut | music drops to focused level | Use Background → Blur (level 15) to isolate speaker, then add Text → Scroll for the warning note sliding in from bottom. | Speaker explains the 'before save' concept. Hold frame, add subtle parallax background blur to isolate face. |
| 0:25-0:35 | screen \| code | medium \| zoom | ✅ Post-Stage or OutputParameters['id'] | zoom bump | positive 'ding' SFX + music builds | Use Keyframes on Transform (scale 100% → 130%) with Ease In/Out. Add Adjust → Brightness/Contrast to make code text pop. | Zoom into OutputParameters dictionary. Show how 'id' is populated after save. Keep code font size ≥ 18pt for mobile readability. |
| 0:35-0:45 | screen \| code | static \| slow push-in | ❌ entity['accountid'] → ✅ context.OutputParameters['id'] 💻 | cut | typing SFX + subtle success chime | Use Text → Highlight to color-code the fix, then apply Effects → Glitch (subtle, 10%) on the transition between ❌ and ✅. | Show before/after code side-by-side. Highlight the fix line. Keep captions inside safe zone. Sync push with VO emphasis. |
| 0:45-0:50 | talking-head \| graphic | medium \| slow push-in | Wrong Stage 🚫 → Right Stage ✅ = Stable Plugin 🛡️ | jump cut | confident music swell + shield icon SFX | Use Adjust → Stabilize to smooth the push-in, then add Stickers → Shield with Keyframes (scale 0% → 100%) synced to 'Stable Plugin'. | Speaker delivers 'Albadry Says' line. Add subtle camera shake on 'Wrong Stage', stabilize on 'Right Stage'. |
| 0:50-0:60 | talking-head \| graphic | close-up \| static | Comment: Pipeline 📩 → Subscribe 🔔 → Next: Sandbox Isolation 🧪 | cut | upbeat outro music + notification SFX | Use Text → Typewriter for the CTA line, then apply Effects → Pop to the subscribe icon. Add Keyframes to slide comment box in from left. | Hold frame for 5s, add animated arrows pointing to comment/subscribe buttons. Keep text in safe zone. Loop-ready ending. |

### Short #3 · Quick Tip

| Time | Shot | Camera | On-screen | Transition | Audio | CapCut tip | Note |
|---|---|---|---|---|---|---|---|
| 0:00-0:03 | talking-head | close-up | 500 Error؟ Plugin بيكسر النظام؟ | jump cut | Upbeat tech music / SFX: error buzz | Use 'Auto Captions' → Style → Arabic font, set to 'Typewriter' effect for instant readability. | Start with a quick 1.2x zoom on the error popup, then cut to face. |
| 0:03-0:10 | graphic | static | خلط المراحل = بطء + Bugs ⚠️ | cut | Music continues / SFX: warning beep | Use 'Split Screen' → Vertical split. Apply 'Keyframes' to animate the warning icon sliding in from the left. | Use split screen effect. Highlight 'Pre' vs 'Post' visually with contrasting colors. |
| 0:10-0:15 | graphic | zoom | Pre-validation \| Pre-operation \| Post-operation \| Post-validation | push | Music continues / SFX: pop/whoosh | Use 'Text → Animated → Pop' for each stage label. Add 'Keyframes' to the background graphic for a slow push-in. | Stagger the 4 stage labels appearing sequentially in sync with the voiceover. |
| 0:15-0:22 | code | close-up | Pre-Op = تعديل/Validation \| Post-Op = Logging/Workflow | jump cut | Music continues / SFX: keyboard tap | Use 'Transform' to scale up the code snippet. Add 'Mask → Rectangle' to highlight specific lines. Sync 'Auto Captions' to voice. | Punch-in/zoom on the code line. Highlight `Stage = 20` in green, `Stage = 40` in blue. |
| 0:22-0:26 | code | zoom | استخدم Depth > 1 عشان متدخلش Loop 🔁 | zoom bump | Music dips slightly / SFX: loop warning | Use 'Keyframes' for a rapid zoom bump on the `Depth > 1` line. Add a red warning sticker from 'Stickers' library. | Show `if (context.Depth > 1) return;` clearly. Keep it on screen for 2 full seconds. |
| 0:26-0:34 | demo | over-shoulder | حدد Stage \| Message \| ExecutionMode \| Image | cut | Music continues / SFX: checkmark ding | Use 'Chroma Key' or 'Mask' to overlay the red X. Apply 'Speed → Curve' to slow down slightly when mentioning 'Image' for emphasis. | Show plugin registration XML/code. Red X appears if Image is missing. |
| 0:34-0:42 | b-roll | wide | المرحلة الصح + Images + Depth > 1 = System Fast | push | Music swells / SFX: success chime | Use 'Effects → Glitch/Neon' on the checkmark. Apply 'Blend → Screen' for a clean overlay. Keep text within 10% safe zone. | Clean, fast animation. Show transaction success vs failure side-by-side. |
| 0:42-0:50 | talking-head | medium | جربها Sandbox 🧪 \| الفيديو الطويل في البايو \| اشترك | cut | Music fades out / SFX: subscribe click | Use 'Stickers → Subscribe Button'. Apply 'Transition → Push' for a clean end. Use 'Audio → Fade Out' last 2 seconds. | Point to subscribe button/link. End screen elements fade in. |

### Short #4 · Advanced

| Time | Shot | Camera | On-screen | Transition | Audio | CapCut tip | Note |
|---|---|---|---|---|---|---|---|
| 0:00-0:03 | talking-head | close-up | 8 Pipeline Stages \| ⚠️ Loop؟ المشكلة في المراحل! | cut | Upbeat tech loop, SFX: glitch/error beep | Use 'Canvas' → 'Blur' background, then 'Stickers' → 'Text' for the warning. Apply 'Keyframes' to animate the split line. | Split screen left: broken plugin code. Right: bold 'Loop?' warning. Keep host face in bottom third for safe zone. |
| 0:03-0:10 | graphic | zoom | Pre-Validation ≠ Pre-Operation \| ❌ بيانات مش محفوظة \| ❌ Plugin بيكرر | jump cut | Music dips slightly, SFX: swipe/click | Use 'Text' → 'Typewriter' for the bullet points. Apply 'Transform' keyframes to move arrows sequentially. | Animate arrows pointing to 'Pre-Validation' and 'Pre-Operation'. Highlight '❌' in red. |
| 0:10-0:15 | graphic | pan | 8 Pipeline Stages \| ⏱️ Timing is everything | cut | Music resumes, SFX: subtle whoosh per stage | Use 'Effects' → 'Glitch' or 'Neon' on the active box. Use 'Auto Captions' for the stage names if needed, but manual 'Text' is better for precise timing. | Light up 8 pipeline boxes sequentially. Keep host voiceover crisp. |
| 0:15-0:35 | code | close-up | StepNumber + PreEntityImages \| ✅ Pre-Validation = Check Only \| ✅ Post-Operation = Business Logic | j-cut | Music steady, SFX: keyboard typing, highlight glow | Use 'Keyframes' on 'Transform' to zoom into the specific line. Apply 'Color Correction' to increase contrast on highlighted text. Use 'Text' → 'Mask' to reveal the badge smoothly. | Highlight `StepNumber` and `IPluginExecutionContext` in yellow. Show 'Albadry Says: Treat Pipeline like a Traffic System 🚦' as a floating badge. |
| 0:35-0:45 | demo | over-shoulder | StepNumber + 1 \| 🔑 context.OutputParameters["id"] \| ✅ Cross-Instance Fixed | zoom bump | Music builds, SFX: success chime | Use 'Auto Captions' for the code line, then apply 'Keyframes' on 'Position' to slide the ID variable into a 'Callout' sticker. Use 'Transform' for precise movement. | Show the exact line: `var pluginId = context.OutputParameters["id"];`. Animate the ID being passed to the next step. |
| 0:45-0:50 | graphic | static | ⚡ Faster \| 🐛 Less Bugs \| 🛠️ Easier Debug | cut | Music peaks, SFX: speed-up/boost | Use 'Stickers' → 'Checkmark' or 'Lightning' for icons. Apply 'Opacity' keyframes to fade in the console background. Use 'Text' → 'Scroll' for the three bullet points. | Clean console output fades in behind. Host returns to frame for final line. |
| 0:50-1:00 | talking-head | medium | 👇 جربها وشاركنا \| 🔔 Subscribe for Deep Tech | push | Music fades out, SFX: subscribe click | Use 'Stickers' → 'Arrow' pointing down. Apply 'Keyframes' on 'Transform' to scale the subscribe button. Use 'Export' settings: 1080x1920, 30fps, high bitrate. | Channel logo animates in. Subscribe button pulses. Keep host pointing/gesturing to subscribe area. |

### Short #5 · Question

| Time | Shot | Camera | On-screen | Transition | Audio | CapCut tip | Note |
|---|---|---|---|---|---|---|---|
| 0:00-0:03 | talking-head | close-up | Plugin بيتسحب؟ المشكلة من الـ Pipeline مش الكود! | cut | Upbeat tech background music starts | Use Transform → Scale 120% at 0:02, then keyframe back to 100% at 0:03 for a quick punch-in effect. | Fast punch-in on 'Pipeline' keyword to grab attention. Host speaks directly to lens. |
| 0:03-0:07 | screen | static | Create/Update = خطوات متسلسلة | jump cut | Mouse click SFX | Use Auto Captions → Select Arabic font, set to 'Typewriter' style, position in lower third safe zone. | Screen recording of CRM form save action. Freeze frame on error message. |
| 0:07-0:10 | code | over-shoulder | ترتيب غلط = بيانات غلط / Loop / Crash | cut | Error buzzer SFX (short) | Apply 'Zoom' keyframe from 100% to 140% on 'Loop/Crash' text, then return to 100%. | Highlight infinite loop console output. Quick zoom on 'Crash' text. |
| 0:10-0:15 | graphic | static | Pipeline = 12 مرحلة \| Pre-validation → Post-operation | push | UI swipe SFX | Use Text → Scroll effect for the pipeline stages, set speed to 1x, enable 'Keep on screen'. | Animate a horizontal pipeline diagram. Highlight '12' and 'Pre/Post'. |
| 0:15-0:25 | screen | static | Pre = قبل DB \| Post = بعد Commit | cut | Database ping SFX | Use Stickers → Arrow/Callout to point at the 'Step Number' field. Set opacity to 80%. | Screen recording of Plugin Registration Tool showing stage numbers. Add red arrow pointing to 'Stage' field. |
| 0:25-0:35 | code | close-up | Stage 10 vs 50 \| Update بعد Create بنفس Entity | j-cut | Typing SFX + subtle background music drop | Use Split Screen feature (9:16 vertical) → Top/Bottom layout. Keyframe the execution order arrows from bottom to top. | Split screen: Top shows Create (Stage 50), Bottom shows Update (Stage 10). Animate arrows showing execution order. |
| 0:35-0:45 | demo | static | Plugin Registration Tool \| غيّر Step: 50 → 10 \| شوف Trace Log | zoom bump | Success chime SFX | Use 'Auto Captions' → Sync with voiceover. Apply 'Transform' keyframe to zoom into the Trace Log window at 0:40. | Mouse clicks 'Change Step' field. Type '10'. Click 'Register/Update'. Open Trace Log window showing sequential execution. |
| 0:45-0:50 | talking-head | medium | Pipeline = ضمانة الـ Business Logic \| Stage 10: تحقق \| Stage 50: تنفيذ | cut | Music swells slightly | Use Text → Typewriter for the summary line. Enable 'Safe Zone' guide to ensure it stays within 9:16 boundaries. | Host speaks directly to camera. Quick lower-third graphic appears with the summary text. |
| 0:50-0:60 | talking-head | medium | انت بتستخدم Stage 10 ولا 50؟ \| اكتب أخطر Plugin Bug 👇 | cut | Music fades out, subtle whoosh on 'CTA' | Use 'Stickers' → Down Arrow. Add 'Keyframe' on opacity (0% → 100% → 0%) for a pulsing effect. Export at 1080x1920, 30fps. | Host points down. End screen graphic appears with subscribe/comment prompt. |

## 🎨 COLOR GRADE CARDS (CapCut)

### Long

Global: Exposure undefined · Contrast undefined · Saturation undefined · Temperature undefined · Tint undefined · Highlights undefined · Shadows undefined · Vignette undefined
Scenes: 0:00-0:32: Intro Hook (Shots 1-4): Clean, punchy. Slight warmth boost on talking-head. Skin saturation -10.; 0:32-1:15: Talking Head Setup (Shots 5-9): Warm temperature +18, skin protection active. Maintain #f5b342 text accents.; 1:15-1:58: Screen Recording 1 (Shots 10-15): Desaturate UI elements by -15, boost contrast +25 to keep punchy. No skin adjustments.; 1:58-2:42: B-Roll Sequence (Shots 16-19): Slightly warm highlights, clean shadows. Gold accent #f5b342 on lower thirds.; 2:42-3:25: Talking Head 2 (Shots 20-25): Restore skin saturation -10, bump warmth +20. Gentle S-curve on RGB curves.; 3:25-4:08: Screen Recording 2 (Shots 26-30): Keep UI true-to-life, desaturate background slightly, maintain contrast +25.; 4:08-4:52: Montage Sequence (Shots 31-35): Punchy cuts, global filter intensity 35, vignette 15.; 4:52-5:35: Albadry Says Moment (Shots 36-38): Vignette bump to 35, skin protection + warmth, gold accent glow on text.; 5:35-6:18: Screen Recording 3 (Shots 39-42): UI desaturation -20, highlight roll-off -8 for clean whites.; 6:18-7:02: Talking Head Wrap-up (Shots 43-45): Warm temperature +18, skin saturation -10, contrast +25.; 7:02-7:45: Outro Montage (Shots 46-47): Full brand grade, gold accent #f5b342 on end screen elements, vignette 20.
CapCut tips: Apply the Global Adjust layer over every clip so the whole pack shares one look. · Add a vignette bump on the 'Albadry Says' moment. · Use Curves for a gentle S. · Add a LUT on the Filter layer.

### Short #0 · Curiosity (Pre-Launch)

Global: Exposure undefined · Contrast undefined · Saturation undefined · Temperature undefined · Tint undefined · Highlights undefined · Shadows undefined · Vignette undefined
Scenes: 0:00-0:06: Opening hook (talking-head): +8 temperature, skin_saturation -8 to protect complexion, crisp highlights for clean punch.; 0:06-0:14: Screen recording #1: -15 saturation, -5 exposure to keep UI elements true and readable, neutral temperature to avoid gold bleed.; 0:14-0:22: B-roll/establishing: +10 contrast, +5 gold accent lift in midtones, vignette at 20 to frame vertical composition.; 0:22-0:30: Screen recording #2: -20 saturation, +8 shadows to prevent dark UI crush, maintain clean contrast for interface clarity.; 0:30-0:38: Albadry Says moment: bump vignette to 45, +12 temperature, isolate skin_saturation -3 to keep host looking natural and warm.; 0:38-0:45: Outro/CTA: restore global contrast to +15, ensure gold text #f5b342 pops against darkened background, lock safe zone.
CapCut tips: Apply the Global Adjust layer over every clip so the whole pack shares one look. · Add a vignette bump on the 'Albadry Says' moment to draw focus to the speaker. · Use Curves for a gentle S-curve to boost punch without crushing blacks. · Add a LUT on the Filter layer, then use the Adjust layer for fine-tuning exposure and skin tones. · For screen recordings, disable 'Auto Enhance' and manually lower saturation to preserve UI accuracy. · Lock text safe area to center-bottom 9:16 frame to avoid platform UI overlap.

### Short #1 · Biggest Insight

Global: Exposure undefined · Contrast undefined · Saturation undefined · Temperature undefined · Tint undefined · Highlights undefined · Shadows undefined · Vignette undefined
Scenes: 0:00-0:05: Hook/Intro: Talking head. Apply +5 temperature and +10 skin_saturation to protect complexions. Keep highlights crisp for a punchy face reveal.; 0:05-0:11: Problem/Context: Screen recording. Push saturation -12 and contrast +5 to strip UI noise. Maintain true color accuracy so software elements stay readable.; 0:11-0:19: Core Insight: Talking head. Revert skin_saturation to -15, add +4 warmth. Use Curves (RGB) for a gentle S-curve to boost contrast without crushing shadows.; 0:19-0:26: Proof/Demo: Screen recording. Keep desaturation -10, boost clarity +8. Ensure UI text remains legible; avoid heavy vignette here to maintain focus on the interface.; 0:26-0:31: Albadry Says moment: Talking head. Bump vignette to 45, add +6 gold tint to highlights. Skin saturation back to -15 to prevent orange shift during brand callouts.; 0:31-0:36: CTA/Outro: Screen recording. Standardize to global settings. Slight exposure lift (+2) to make call-to-action UI pop before the final cut.
CapCut tips: Apply a single Global Adjust layer over every clip so the whole pack shares one look and allows batch tweaking. · Add a vignette bump specifically on the 'Albadry Says' moment to draw focus and add cinematic weight. · Use the Curves tool for a gentle S-curve on the RGB channel to boost contrast without clipping highlights or crushing shadows. · Place your chosen LUT on the Filter layer at 40-50% intensity, then use the Master panel for fine-tuning exposure and temperature. · For screen recordings, manually desaturate UI elements or use a mask to protect text readability while keeping the background punchy. · Lock your 9:16 aspect ratio early; use CapCut's 'Auto Reframe' sparingly, preferring manual keyframing for precise vertical framing.

### Short #2 · Common Mistake

Global: Exposure undefined · Contrast undefined · Saturation undefined · Temperature undefined · Tint undefined · Highlights undefined · Shadows undefined · Vignette undefined
Scenes: 0:00-0:03: Talking head hook: boost skin_saturation -5, add +3 temperature for slight warmth, keep highlights crisp for punchy opener.; 0:03-0:06: Screen recording: desaturate -12, lower exposure -3, neutralize temperature 0 to preserve UI accuracy and data readability.; 0:06-0:09: Talking head context: restore skin_saturation -8, apply gentle S-curve to midtones, maintain gold accent #f5b342 on key text overlays.; 0:09-0:12: Screen recording step 2: keep desaturation -12, boost contrast +5, ensure text overlays stay within safe zone with brand gold color.; 0:12-0:15: Screen recording proof: maintain UI-neutral grade, add +8 highlights to make call-to-action buttons pop without clipping.; 0:15-0:18: Talking head payoff: revert skin_saturation to -8, increase warmth +2, apply vignette 15 to frame face and text naturally.; 0:18-0:21: Albadry Says moment: bump vignette to 35, push temperature +4, sharpen midtones, keep skin_saturation -8 to protect complexion during close-up.; 0:21-0:24: Screen recording CTA: strict desaturation -15, neutral temperature, high contrast +10 for UI clarity, brand gold #f5b342 on buttons.; 0:24-0:28: Talking head outro: restore global warmth +3, skin_saturation -8, slight vignette 20, ensure text remains safe and gold-accented.
CapCut tips: Apply a Global Adjust layer over every clip so the whole pack shares one look. · Add a vignette bump on the 'Albadry Says' moment to draw focus to your face and text. · Use Curves for a gentle S to boost punchy midtones without crushing shadows or blowing highlights. · Add a LUT on the Filter layer first, then fine-tune with manual sliders so the gold accent #f5b342 stays consistent across all text.

### Short #3 · Quick Tip

Global: Exposure undefined · Contrast undefined · Saturation undefined · Temperature undefined · Tint undefined · Highlights undefined · Shadows undefined · Vignette undefined
Scenes: 0:00-0:04: Hook: Talking-head. Apply skin protection (-18 sat), +12 temp for slight warmth, keep highlights clipped at -10 to maintain clean punch.; 0:04-0:08: Problem: Screen recording. Desaturate UI elements by -15 local sat, cool temperature by -5 to make gold accents pop, preserve text readability.; 0:08-0:13: Context: Mixed. Apply Curves layer for gentle S-curve, lift shadows +15, keep skin tones intact, boost gold accent via global saturation +10.; 0:13-0:19: Core Insight: Talking-head. Revert screen-recording desat, apply slight warmth +10, protect skin saturation, keep vignette at 25 for focus.; 0:19-0:24: Proof: Screen recording. Cool tint -3, desaturate UI by -12, boost contrast +12 for punch, ensure gold #f5b342 text remains legible.; 0:24-0:29: Albadry Says: Talking-head. Increase vignette to 45 for dramatic focus, push temperature +8, maintain skin protection, apply Curves S-shape subtly.; 0:29-0:33: Payoff: Mixed. Restore global balance, keep shadows +18, highlights -8, ensure gold accent text stays crisp against darkened UI.; 0:33-0:36: CTA: Talking-head. Final pass: global filter at 45, exposure -1, skin sat -15, vignette 25, lock gold text color and size for brand consistency.
CapCut tips: Apply the Global Adjust layer over every clip so the whole pack shares one look; avoid per-clip grading drift. · Add a vignette bump on the 'Albadry Says' moment (increase to 40-45) to naturally draw the eye to the speaker. · Use Curves for a gentle S to boost punch without crushing shadows or clipping highlights. · Add a LUT on the Filter layer first, then fine-tune with manual sliders; this preserves the base color science. · For screen recordings, use a local HSL or selective color mask to desaturate UI backgrounds slightly, making the gold accent and white text pop without oversaturating the interface. · Lock your text layer properties (color #f5b342, size 18, safe zone) in the master template to prevent accidental brand drift across edits.

### Short #4 · Advanced

Global: Exposure undefined · Contrast undefined · Saturation undefined · Temperature undefined · Tint undefined · Highlights undefined · Shadows undefined · Vignette undefined
Scenes: 0:00-0:06: Hook (Talking Head): Apply skin_saturation protection (-10), +3 exposure, crisp highlights. Slight warmth +4 to establish brand tone.; 0:06-0:14: Screen Recording 1: Desaturate -12, cool temp -6 to neutralize monitor glow, maintain contrast at +15. Keep UI colors true.; 0:14-0:21: B-Roll/Transition: Use Curves for gentle S. Lift shadows +10, pull highlights -12, boost orange/yellow channels for gold accent #f5b342.; 0:21-0:32: Talking Head Segment: Restore warmth +5, protect skin tones (-8), lift shadows +12 for clean face. Keep global contrast punchy.; 0:32-0:42: Screen Recording 2: Desaturate -15, lower highlights -15 to prevent UI clipping, add subtle vignette 10. Maintain technical accuracy.; 0:42-0:50: Albadry Says Moment: Vignette bump to 35, boost gold accent via Curves (red +8, green +3), punchy contrast +20 for emphasis.; 0:50-0:58: Outro/CTA: Return to global baseline, ensure #f5b342 text pops on 9:16 canvas, clean exposure, export-ready.
CapCut tips: Apply a Global Adjust layer over every clip so the whole pack shares one look. · Add a vignette bump specifically on the 'Albadry Says' moment to draw focus. · Use Curves for a gentle S-curve: lift shadows slightly, pull highlights down, and boost midtones for punch. · Add a LUT on the Filter layer first, then use Global Adjust for fine-tuning to avoid clipping. · For screen recordings, manually desaturate UI elements and cool the temperature slightly to keep colors accurate. · Protect skin tones by lowering skin_saturation and adding +3 to temperature during talking-head segments. · Use CapCut's 'Auto Color' sparingly; rely on manual curves and global adjust for brand consistency.

### Short #5 · Question

Global: Exposure undefined · Contrast undefined · Saturation undefined · Temperature undefined · Tint undefined · Highlights undefined · Shadows undefined · Vignette undefined
Scenes: 0:00-0:03: Hook/Talking-head: Slight warmth boost, protect skin tones, keep background clean for vertical framing.; 0:03-0:06: Screen-record 1: Desaturate UI by -5 on local layer, clamp highlights to preserve true app colors.; 0:06-0:09: Screen-record 2: Maintain punchy contrast, apply slight gold tint to shadows for brand consistency.; 0:09-0:12: Screen-record 3: Keep saturation neutral, ensure text overlays read clearly against UI.; 0:12-0:15: Albadry Says moment: Increase vignette to 25, warm skin saturation +12, boost contrast slightly for emphasis.; 0:15-0:18: B-roll/Transition: Apply global S-curve via Curves tool, lift midtones for clean separation.; 0:18-0:21: Final UI reveal: Drop highlights -10, protect screen glare, maintain true-to-life interface.; 0:21-0:24: CTA/Text overlay: Ensure #f5b342 text sits in safe zone, slightly boost local contrast for readability.; 0:24-0:27: Outro/Talking-head: Lock skin protection, keep gold accent in lower-third graphics, maintain clean baseline.
CapCut tips: Apply a Global Adjust layer over every clip so the whole pack shares one look. · Add a vignette bump on the "Albadry Says" moment to naturally draw focus to the host. · Use Curves for a gentle S-curve to preserve shadow detail while keeping the punchy contrast. · Add a LUT on the Filter layer, then dial intensity down to 30-40 to avoid crushing blacks or oversaturating UI elements. · For screen recordings, use the Color Mixer to desaturate blues/greens slightly so app UI stays true without clashing with the warm brand grade.


---
*Generated by Albadry Content Engine.*
