import { ReactNode, useMemo } from "react";

import PublicLayout from "../components/layouts/PublicLayout";
import { useInViewMultiple } from "../hooks/useMultipleObserver";

const Home = () => {
  const { ref, states } = useInViewMultiple({ numberOfObserver: ["01", "02", "03"] });

  const tt1 = useMemo(() => ref(0), [ref]);
  const tt2 = useMemo(() => ref(1), [ref]);
  const tt3 = useMemo(() => ref(2), [ref]);

  return (
    <div style={{ maxWidth: "900px", margin: "auto" }}>
      <div style={{ position: "sticky", top: "0px", background: "black" }}>
        <h2>Obs1:{states["01"].inView}</h2>
        <h2>Obs1:{states["02"].inView}</h2>
        <h2>Obs1:{states["03"].inView}</h2>
      </div>
      <div ref={tt1} style={{ border: "solid 2px red" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt aliquid nemo laboriosam voluptatum, illum sunt
        cum totam? Quibusdam repellendus deserunt nulla doloremque nobis minus sed, iure consectetur quisquam ex
        veritatis a itaque exercitationem laboriosam labore saepe quasi porro eligendi facilis, dolor laudantium
        expedita. Sunt exercitationem temporibus perspiciatis cum? Nesciunt quibusdam molestias rerum labore reiciendis,
        nihil provident architecto iure illum, accusantium beatae quidem a dicta blanditiis tenetur ipsa eos veniam id
        earum consequuntur! Quas, suscipit dicta consectetur ab modi tenetur non nulla, corrupti ipsam iure adipisci
        corporis veniam sint? Consequuntur, suscipit animi totam officiis pariatur deleniti dolor explicabo repellat
        labore natus facilis ut temporibus dolores sit consectetur expedita illo fuga autem tempora in aliquam atque
        odio. Accusantium beatae a vero assumenda! Dignissimos, reprehenderit laboriosam minima temporibus debitis
        adipisci iusto amet enim velit dolorum quis nam quibusdam iure aut aperiam excepturi animi nisi labore odit
        eveniet maiores molestiae hic. Maiores tempore molestias amet ipsa dolore! Labore laboriosam ipsum temporibus
        voluptates, sit similique in reprehenderit officia explicabo dolore distinctio voluptatem aut nesciunt omnis
        possimus! Quod doloremque itaque sit laudantium, similique, rerum fugiat eius ipsa quibusdam sunt est nobis, nam
        omnis commodi. Eos eum consequatur, unde vel ipsum voluptas atque libero incidunt quod. Eaque, fugit ducimus
        inventore accusantium fugiat totam corrupti placeat iure dolorum quas voluptas deserunt obcaecati esse assumenda
        optio quisquam. Consectetur, fugiat. Enim, ducimus. Cumque labore nisi odio possimus commodi sequi quasi neque,
        vel nihil! Exercitationem quo maiores nihil dolorum, natus soluta quae cumque animi sapiente consequuntur
        assumenda eum harum laborum enim ex officiis placeat, voluptatem sed voluptatibus ipsum autem quaerat numquam
        voluptas architecto? Delectus aut repudiandae officia voluptatum impedit odio modi? Velit ducimus, consectetur
        et labore quis possimus, sapiente iure fugiat, molestias impedit ullam ex! Rem deserunt, dolor veritatis quae ut
        hic, error modi corrupti tempora voluptatem sapiente vero delectus dicta? Enim beatae aut earum error omnis fuga
        quibusdam necessitatibus corporis. Autem doloremque beatae unde maxime nemo nihil modi fugit alias officia,
        temporibus nulla quo, dolorem totam ullam quas ducimus tempora, et ipsam dolor ab! Fuga possimus atque, at
        veritatis quo facilis quis, itaque laborum facere quos ipsum? Quo dolores nesciunt, dicta rerum ducimus neque
        dignissimos porro obcaecati eius eaque eligendi veritatis pariatur similique sed consectetur, at quam alias
        ullam atque asperiores dolorum? Voluptatum, eveniet! Reiciendis tenetur libero quis unde exercitationem iure,
        esse laborum temporibus dicta, explicabo provident molestias suscipit totam quae blanditiis! Deleniti quis
        magnam impedit repellendus nulla cupiditate blanditiis temporibus doloribus non laborum natus reprehenderit modi
        laudantium, nesciunt aspernatur quaerat adipisci qui vero rem consectetur atque eaque. Cumque quo molestiae
        porro cum necessitatibus perferendis laudantium illo exercitationem, quod, numquam, neque libero aliquid! Fugiat
        quaerat a quas vitae laudantium voluptates possimus! Sapiente quo a corporis ducimus iusto odit fuga harum,
        libero porro, non veniam sunt molestias adipisci atque ex. Aliquid sapiente quae praesentium ipsum! Vitae neque
        veniam illum culpa cum mollitia, atque temporibus ad iusto accusantium ut ducimus dolores? Error sequi deserunt
        quos ut unde accusamus vero laborum sunt atque iure! Quos, eum! Assumenda nostrum, atque corrupti totam pariatur
        animi.
      </div>
      <div ref={tt2} /* ref={e => ref(1, e)} */ style={{ border: "solid 2px blue" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt aliquid nemo laboriosam voluptatum, illum sunt
        cum totam? Quibusdam repellendus deserunt nulla doloremque nobis minus sed, iure consectetur quisquam ex
        veritatis a itaque exercitationem laboriosam labore saepe quasi porro eligendi facilis, dolor laudantium
        expedita. Sunt exercitationem temporibus perspiciatis cum? Nesciunt quibusdam molestias rerum labore reiciendis,
        nihil provident architecto iure illum, accusantium beatae quidem a dicta blanditiis tenetur ipsa eos veniam id
        earum consequuntur! Quas, suscipit dicta consectetur ab modi tenetur non nulla, corrupti ipsam iure adipisci
        corporis veniam sint? Consequuntur, suscipit animi totam officiis pariatur deleniti dolor explicabo repellat
        labore natus facilis ut temporibus dolores sit consectetur expedita illo fuga autem tempora in aliquam atque
        odio. Accusantium beatae a vero assumenda! Dignissimos, reprehenderit laboriosam minima temporibus debitis
        adipisci iusto amet enim velit dolorum quis nam quibusdam iure aut aperiam excepturi animi nisi labore odit
        eveniet maiores molestiae hic. Maiores tempore molestias amet ipsa dolore! Labore laboriosam ipsum temporibus
        voluptates, sit similique in reprehenderit officia explicabo dolore distinctio voluptatem aut nesciunt omnis
        possimus! Quod doloremque itaque sit laudantium, similique, rerum fugiat eius ipsa quibusdam sunt est nobis, nam
        omnis commodi. Eos eum consequatur, unde vel ipsum voluptas atque libero incidunt quod. Eaque, fugit ducimus
        inventore accusantium fugiat totam corrupti placeat iure dolorum quas voluptas deserunt obcaecati esse assumenda
        optio quisquam. Consectetur, fugiat. Enim, ducimus. Cumque labore nisi odio possimus commodi sequi quasi neque,
        vel nihil! Exercitationem quo maiores nihil dolorum, natus soluta quae cumque animi sapiente consequuntur
        assumenda eum harum laborum enim ex officiis placeat, voluptatem sed voluptatibus ipsum autem quaerat numquam
        voluptas architecto? Delectus aut repudiandae officia voluptatum impedit odio modi? Velit ducimus, consectetur
        et labore quis possimus, sapiente iure fugiat, molestias impedit ullam ex! Rem deserunt, dolor veritatis quae ut
        hic, error modi corrupti tempora voluptatem sapiente vero delectus dicta? Enim beatae aut earum error omnis fuga
        quibusdam necessitatibus corporis. Autem doloremque beatae unde maxime nemo nihil modi fugit alias officia,
        temporibus nulla quo, dolorem totam ullam quas ducimus tempora, et ipsam dolor ab! Fuga possimus atque, at
        veritatis quo facilis quis, itaque laborum facere quos ipsum? Quo dolores nesciunt, dicta rerum ducimus neque
        dignissimos porro obcaecati eius eaque eligendi veritatis pariatur similique sed consectetur, at quam alias
        ullam atque asperiores dolorum? Voluptatum, eveniet! Reiciendis tenetur libero quis unde exercitationem iure,
        esse laborum temporibus dicta, explicabo provident molestias suscipit totam quae blanditiis! Deleniti quis
        magnam impedit repellendus nulla cupiditate blanditiis temporibus doloribus non laborum natus reprehenderit modi
        laudantium, nesciunt aspernatur quaerat adipisci qui vero rem consectetur atque eaque. Cumque quo molestiae
        porro cum necessitatibus perferendis laudantium illo exercitationem, quod, numquam, neque libero aliquid! Fugiat
        quaerat a quas vitae laudantium voluptates possimus! Sapiente quo a corporis ducimus iusto odit fuga harum,
        libero porro, non veniam sunt molestias adipisci atque ex. Aliquid sapiente quae praesentium ipsum! Vitae neque
        veniam illum culpa cum mollitia, atque temporibus ad iusto accusantium ut ducimus dolores? Error sequi deserunt
        quos ut unde accusamus vero laborum sunt atque iure! Quos, eum! Assumenda nostrum, atque corrupti totam pariatur
        animi.
      </div>
      <div ref={tt3} /* ref={e => ref(2, e)} */ style={{ border: "solid 2px yellow" }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt aliquid nemo laboriosam voluptatum, illum sunt
        cum totam? Quibusdam repellendus deserunt nulla doloremque nobis minus sed, iure consectetur quisquam ex
        veritatis a itaque exercitationem laboriosam labore saepe quasi porro eligendi facilis, dolor laudantium
        expedita. Sunt exercitationem temporibus perspiciatis cum? Nesciunt quibusdam molestias rerum labore reiciendis,
        nihil provident architecto iure illum, accusantium beatae quidem a dicta blanditiis tenetur ipsa eos veniam id
        earum consequuntur! Quas, suscipit dicta consectetur ab modi tenetur non nulla, corrupti ipsam iure adipisci
        corporis veniam sint? Consequuntur, suscipit animi totam officiis pariatur deleniti dolor explicabo repellat
        labore natus facilis ut temporibus dolores sit consectetur expedita illo fuga autem tempora in aliquam atque
        odio. Accusantium beatae a vero assumenda! Dignissimos, reprehenderit laboriosam minima temporibus debitis
        adipisci iusto amet enim velit dolorum quis nam quibusdam iure aut aperiam excepturi animi nisi labore odit
        eveniet maiores molestiae hic. Maiores tempore molestias amet ipsa dolore! Labore laboriosam ipsum temporibus
        voluptates, sit similique in reprehenderit officia explicabo dolore distinctio voluptatem aut nesciunt omnis
        possimus! Quod doloremque itaque sit laudantium, similique, rerum fugiat eius ipsa quibusdam sunt est nobis, nam
        omnis commodi. Eos eum consequatur, unde vel ipsum voluptas atque libero incidunt quod. Eaque, fugit ducimus
        inventore accusantium fugiat totam corrupti placeat iure dolorum quas voluptas deserunt obcaecati esse assumenda
        optio quisquam. Consectetur, fugiat. Enim, ducimus. Cumque labore nisi odio possimus commodi sequi quasi neque,
        vel nihil! Exercitationem quo maiores nihil dolorum, natus soluta quae cumque animi sapiente consequuntur
        assumenda eum harum laborum enim ex officiis placeat, voluptatem sed voluptatibus ipsum autem quaerat numquam
        voluptas architecto? Delectus aut repudiandae officia voluptatum impedit odio modi? Velit ducimus, consectetur
        et labore quis possimus, sapiente iure fugiat, molestias impedit ullam ex! Rem deserunt, dolor veritatis quae ut
        hic, error modi corrupti tempora voluptatem sapiente vero delectus dicta? Enim beatae aut earum error omnis fuga
        quibusdam necessitatibus corporis. Autem doloremque beatae unde maxime nemo nihil modi fugit alias officia,
        temporibus nulla quo, dolorem totam ullam quas ducimus tempora, et ipsam dolor ab! Fuga possimus atque, at
        veritatis quo facilis quis, itaque laborum facere quos ipsum? Quo dolores nesciunt, dicta rerum ducimus neque
        dignissimos porro obcaecati eius eaque eligendi veritatis pariatur similique sed consectetur, at quam alias
        ullam atque asperiores dolorum? Voluptatum, eveniet! Reiciendis tenetur libero quis unde exercitationem iure,
        esse laborum temporibus dicta, explicabo provident molestias suscipit totam quae blanditiis! Deleniti quis
        magnam impedit repellendus nulla cupiditate blanditiis temporibus doloribus non laborum natus reprehenderit modi
        laudantium, nesciunt aspernatur quaerat adipisci qui vero rem consectetur atque eaque. Cumque quo molestiae
        porro cum necessitatibus perferendis laudantium illo exercitationem, quod, numquam, neque libero aliquid! Fugiat
        quaerat a quas vitae laudantium voluptates possimus! Sapiente quo a corporis ducimus iusto odit fuga harum,
        libero porro, non veniam sunt molestias adipisci atque ex. Aliquid sapiente quae praesentium ipsum! Vitae neque
        veniam illum culpa cum mollitia, atque temporibus ad iusto accusantium ut ducimus dolores? Error sequi deserunt
        quos ut unde accusamus vero laborum sunt atque iure! Quos, eum! Assumenda nostrum, atque corrupti totam pariatur
        animi.
      </div>
    </div>
  );
};

export default Home;

Home.getLayout = (page: ReactNode) => {
  return <PublicLayout>{page}</PublicLayout>;
};
